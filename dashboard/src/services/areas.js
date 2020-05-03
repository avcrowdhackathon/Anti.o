const locations =  require('../assets/data/locations_gr.js')

const getRegions = () => Array.from(new Set(locations.map(area => area.periferiesid)))
  .map(id => ({
    id,
    name: locations.find(m => m.periferiesid === id).periferies_name
  }));

const getMunicipalities = () => Array.from(new Set(locations.map(area => area.nomosid)))
  .map(id => {
    const municipality = locations.find(m => m.nomosid === id) 
    return  {
      id,
      regionId: municipality.periferiesid,
      name: municipality.nomos_name
    }
  });

const getCounties = () => locations.map(area => ({
  id: area.dimosid,
  name: area.dimos_name,
  municipalityId: area.nomosid,
  regionId: area.periferiesid
}))

export default () => ({
  regions: getRegions(),
  municipalities: getMunicipalities(),
  counties: getCounties()
});
