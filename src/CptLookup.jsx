import { useState, useEffect, useRef } from 'react';
import './CptLookup.css'

// Parent main component
function CptLookup() {
    const [codes, setCodes] = useState([]);
    const [currentCode, setCurrentCode] = useState([]);
    const [submitted, setSubmitted] = useState(false);
    let formData = {
        facility: useRef(''),
        cost: useRef(''),
        copay: useRef('')
    };

    // Data setup
    useEffect(() => {
        fetch('//localhost:3001/api/cptCodes?_embed=costs')
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw response;
        })
        .then(data => {
            setCodes(data);
        })
    }, []);

    // Update state when a different code is picked in the dropdown
    function handleCodeUpdate(e) {
        setCurrentCode(e.target.value);
    }

    // Push to API when new cost is submitted
    async function handleSubmit(e) {
        e.preventDefault();
        let payload = {
            cptCodeId: codes.find(code => code.id == currentCode).id,
            facilityType: formData.facility.current.value,
            cost: parseFloat(formData.cost.current.value),
            copay: parseFloat(formData.copay.current.value)
        };
        await fetch('//localhost:3001/api/costs', {
                method: 'POST',
                body: JSON.stringify(payload),
                headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                }
            })
            .then(response => response.json())
            .then((data) => {
                console.log(data);
                setSubmitted(true);
                let newCodes = codes;
                newCodes.find(code => code.id == currentCode).costs.push(data);
                setCodes(newCodes);
            })
            .catch(err => console.log(err.message));
    }

    // Reset the form once user confirms the new cost
    function handleReset() {
        formData.facility.current = '';
        formData.cost.current = '';
        formData.copay.current = '';
        setSubmitted(false);
    }
    
    return (
        <div className="cpt-lookup">
            <h2>CPT Code Lookup</h2>
            <CptSelect
              codes={codes}
              onCodeChange={handleCodeUpdate}
              currentCode={currentCode} />
            <CptCost
              codes={codes}
              currentCode={currentCode} />
            <CptCostForm
              codes={codes}
              currentCode={currentCode}
              formData={formData}
              submitted={submitted}
              onSubmit={handleSubmit}
              onReset={handleReset} />
        </div>
    )
}



// Dropdown selection component
function CptSelect({ codes, onCodeChange, currentCode }) {
    return (
        <div className="code-select">
            <select onChange={onCodeChange}>
                { currentCode == '' ?
                    <option>Choose CPT code...</option>
                : null }
                {codes.map((code) => {
                    return (
                        <option
                        key={code.id}
                        value={code.id}
                        >{code.code}</option>
                    )
                })}
            </select>
        </div>
    );
}



// Cost display component
function CptCost({ codes, currentCode }) {
    let code = codes.find(code => code.id == currentCode);
    return (
        <>
        { currentCode != '' ?
        <>
            <div className="about">
                <h3>Costs for {code.code}</h3>
                <p>{code.description}</p>
            </div>
            <div className="costs">
                <>
                    <ul>
                    {code.costs.map((cost) => {
                        return (
                            <li key={cost.id}>
                                <h4>{cost.facilityType}</h4>
                                <p>Cost: {cost.cost}</p>
                                <p>Copay: {cost.copay}</p>
                            </li>
                        )
                    })}
                    </ul>
                </>
            </div>
        </>
        :
        <p>No code selected.</p>
        }
        </>
    );
}



// Form to submit new costs
function CptCostForm({ codes, currentCode, formData, submitted, onSubmit, onReset }) {
    let code = codes.find(code => code.id == currentCode);
    return (
        <>
        { currentCode != '' ?
        <div className="form">
            { submitted === false ?
            <>
                <h3>Enter new cost for {code.code}</h3>
                <form onSubmit={onSubmit}>
                    <input type="hidden" name="codeId" value={code.id} />
                    <label htmlFor="facility">Facility type:</label>
                    <input type="text" name="facility" ref={formData.facility} />
                    <label htmlFor="cost">Cost:</label>
                    <input type="text" name="cost" ref={formData.cost} />
                    <label htmlFor="copay">Copay:</label>
                    <input type="text" name="copay" ref={formData.copay} />
                    <button type="reset">Reset</button>
                    <button type="submit">Submit</button>
                </form>
            </>
            :
            <div className="notice">
                <p>New cost submitted successfully!</p>
                <ul>
                    <li>Facility: {formData.facility.current.value}</li>
                    <li>Cost: {formData.cost.current.value}</li>
                    <li>Copay: {formData.copay.current.value}</li>
                </ul>
                <button onClick={onReset}>Enter another</button>
            </div>
            }
        </div>
        : null }
        </>
    );
}

export default CptLookup;