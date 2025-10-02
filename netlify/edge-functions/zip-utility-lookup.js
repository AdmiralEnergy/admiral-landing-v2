export default async (request, context) => {
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const url = new URL(request.url);
  const zip = url.searchParams.get('zip');

  if (!zip || !/^\d{5}$/.test(zip)) {
    return new Response(JSON.stringify({ error: 'Invalid ZIP code' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  // ZIP code to utility mapping for North Carolina (Duke Energy territory)
  const zipToUtility = {
    // Charlotte Metro Area
    '28201': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28202': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28203': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28204': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28205': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28206': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28207': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28208': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28209': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28210': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28211': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28212': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28213': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28214': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28215': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28216': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28217': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28218': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28219': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28220': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28221': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28222': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28223': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28224': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28226': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28227': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28228': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28229': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28230': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28231': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28232': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28233': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28234': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28235': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28236': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28237': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28269': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28270': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28273': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28274': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28275': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28277': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28278': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28280': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    '28282': { utility: 'duke', city: 'Charlotte', state: 'NC' },
    
    // Raleigh Area
    '27601': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27602': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27603': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27604': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27605': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27606': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27607': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27608': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27609': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27610': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27612': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27613': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27614': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27615': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27616': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    '27617': { utility: 'duke', city: 'Raleigh', state: 'NC' },
    
    // Durham Area
    '27701': { utility: 'duke', city: 'Durham', state: 'NC' },
    '27702': { utility: 'duke', city: 'Durham', state: 'NC' },
    '27703': { utility: 'duke', city: 'Durham', state: 'NC' },
    '27704': { utility: 'duke', city: 'Durham', state: 'NC' },
    '27705': { utility: 'duke', city: 'Durham', state: 'NC' },
    '27706': { utility: 'duke', city: 'Durham', state: 'NC' },
    '27707': { utility: 'duke', city: 'Durham', state: 'NC' },
    '27708': { utility: 'duke', city: 'Durham', state: 'NC' },
    '27709': { utility: 'duke', city: 'Durham', state: 'NC' },
    '27710': { utility: 'duke', city: 'Durham', state: 'NC' },
    '27712': { utility: 'duke', city: 'Durham', state: 'NC' },
    '27713': { utility: 'duke', city: 'Durham', state: 'NC' },
    
    // Other major NC cities served by Duke
    '27401': { utility: 'duke', city: 'Greensboro', state: 'NC' },
    '27402': { utility: 'duke', city: 'Greensboro', state: 'NC' },
    '27403': { utility: 'duke', city: 'Greensboro', state: 'NC' },
    '27404': { utility: 'duke', city: 'Greensboro', state: 'NC' },
    '27405': { utility: 'duke', city: 'Greensboro', state: 'NC' },
    
    '27101': { utility: 'duke', city: 'Winston-Salem', state: 'NC' },
    '27103': { utility: 'duke', city: 'Winston-Salem', state: 'NC' },
    '27104': { utility: 'duke', city: 'Winston-Salem', state: 'NC' },
    '27105': { utility: 'duke', city: 'Winston-Salem', state: 'NC' },
    '27106': { utility: 'duke', city: 'Winston-Salem', state: 'NC' },
    
    '28301': { utility: 'duke', city: 'Fayetteville', state: 'NC' },
    '28303': { utility: 'duke', city: 'Fayetteville', state: 'NC' },
    '28304': { utility: 'duke', city: 'Fayetteville', state: 'NC' },
    '28305': { utility: 'duke', city: 'Fayetteville', state: 'NC' },
    
    // Asheville area
    '28801': { utility: 'duke', city: 'Asheville', state: 'NC' },
    '28803': { utility: 'duke', city: 'Asheville', state: 'NC' },
    '28804': { utility: 'duke', city: 'Asheville', state: 'NC' },
    '28805': { utility: 'duke', city: 'Asheville', state: 'NC' },
    '28806': { utility: 'duke', city: 'Asheville', state: 'NC' },
  };

  const result = zipToUtility[zip];
  
  if (result) {
    return new Response(JSON.stringify({
      zip: zip,
      utility: result.utility,
      utilityName: result.utility === 'duke' ? 'Duke Energy' : 'Other',
      city: result.city,
      state: result.state,
      eligible: result.utility === 'duke',
      powerPairEligible: result.utility === 'duke'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } else {
    return new Response(JSON.stringify({
      zip: zip,
      utility: 'other',
      utilityName: 'Other',
      city: null,
      state: null,
      eligible: false,
      powerPairEligible: false
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

export const config = {
  path: "/api/zip-utility-lookup",
};