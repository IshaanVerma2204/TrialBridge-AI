from typing import Any

import httpx

CT_GOV_BASE_URL = "https://clinicaltrials.gov/api/v2/studies"

async def fetch_trials_by_condition(condition: str, limit: int = 10) -> list[dict[str, Any]]:
    """
    Fetches recruiting clinical trials from ClinicalTrials.gov for a given condition.
    """
    params = {
        "query.cond": condition,
        "filter.overallStatus": "RECRUITING",
        "pageSize": limit,
        "fields": "NCTId,BriefTitle,EligibilityCriteria,OverallStatus,LocationCity"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(CT_GOV_BASE_URL, params=params, timeout=30.0)
        response.raise_for_status()
        data = response.json()
        
        parsed_trials = []
        for study in data.get("studies", []):
            protocol = study.get("protocolSection", {})
            identification = protocol.get("identificationModule", {})
            status_module = protocol.get("statusModule", {})
            eligibility = protocol.get("eligibilityModule", {})
            contacts = protocol.get("contactsLocationsModule", {})
            
            locations = contacts.get("locations", [])
            location_str = locations[0].get("city", "Unknown") if locations else "Unknown"
            
            parsed_trials.append({
                "nct_id": identification.get("nctId"),
                "title": identification.get("briefTitle"),
                "inclusion_criteria": eligibility.get("eligibilityCriteria", ""),
                "exclusion_criteria": "", # It's usually mixed in eligibilityCriteria text for CT.gov
                "status": status_module.get("overallStatus"),
                "location": location_str
            })
            
        return parsed_trials
