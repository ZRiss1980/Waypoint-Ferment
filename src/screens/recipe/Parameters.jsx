// /src/screens/recipe/Parameters.jsx
import React from 'react';
import { useParametersStore } from '../../store/parametersStore';
import useBJCPStyles from '../../hooks/useBJCPStyles';
import useWaterProfiles from '../../hooks/useWaterProfiles';
import useYeastProfiles from '../../hooks/useYeastProfiles';
import '../../theme.css';
import './Parameters.css';
import useUserWaterProfiles from '../../hooks/useUserWaterProfiles';


const Parameters = () => {
  const parameters = useParametersStore((s) => s.parameters);
  const updateParameter = useParametersStore((s) => s.updateParameter);
  React.useEffect(() => {
    console.log("🧪 Live store parameters:", parameters);
  }, [parameters]);

  const styles = useBJCPStyles();
  const { profiles: waterProfiles } = useWaterProfiles();
  const { profiles: userWaterProfiles, loading: waterLoading } = useUserWaterProfiles();
  const { profiles: yeastProfiles, loading: yeastLoading } = useYeastProfiles();

  React.useEffect(() => {
    if (!parameters.yeastStrain || yeastLoading || !Array.isArray(yeastProfiles)) return;

    const strain = yeastProfiles.find(y => y.id === parameters.yeastStrain);
    console.log('Selected strain:', strain);

    if (strain && typeof strain.attenuationAvg === 'number') {
      console.log('Updating attenuationAvg to:', strain.attenuationAvg);
      updateParameter('attenuationAvg', strain.attenuationAvg);

      if (typeof parameters.OG === 'number') {
        const expectedTG = parameters.OG - (parameters.OG * (strain.attenuationAvg / 100));
        console.log('Calculated expectedTG:', expectedTG);
        updateParameter('expectedTG', parseFloat(expectedTG.toFixed(1)));
      }
    } else {
      console.log('No update performed for attenuationAvg.');
    }
  }, [parameters.yeastStrain, yeastProfiles, yeastLoading, parameters.OG]);

  React.useEffect(() => {
    if (typeof parameters.OG === 'number' && typeof parameters.TG === 'number') {
      const abv = (parameters.OG - parameters.TG) / (2.066 - 0.010665 * parameters.OG);
      updateParameter('ABV', parseFloat(abv.toFixed(2)));
    }
  }, [parameters.OG, parameters.TG]);
  const selectedStyle = styles.find((s) => s.number === parameters.style);

  const sgToPlato = (sg) => {
    const parsed = parseFloat(sg);
    if (!parsed || parsed < 1.000) return null;
    return (135.997 * parsed ** 3 - 630.272 * parsed ** 2 + 1111.14 * parsed - 616.868).toFixed(1);
  };

  const avgOG = selectedStyle?.ogmin && selectedStyle?.ogmax
    ? sgToPlato((parseFloat(selectedStyle.ogmin) + parseFloat(selectedStyle.ogmax)) / 2)
    : null;

  const avgTG = selectedStyle?.fgmin && selectedStyle?.fgmax
    ? sgToPlato((parseFloat(selectedStyle.fgmin) + parseFloat(selectedStyle.fgmax)) / 2)
    : null;

  const avgABV = selectedStyle?.abvmin && selectedStyle?.abvmax
    ? ((parseFloat(selectedStyle.abvmin) + parseFloat(selectedStyle.abvmax)) / 2).toFixed(1)
    : null;

  const avgSRM = selectedStyle?.srmmin && selectedStyle?.srmmax
    ? ((parseFloat(selectedStyle.srmmin) + parseFloat(selectedStyle.srmmax)) / 2).toFixed(1)
    : null;

  const avgIBU = selectedStyle?.ibumin && selectedStyle?.ibumax
  ? ((parseFloat(selectedStyle.ibumin) + parseFloat(selectedStyle.ibumax)) / 2).toFixed(0)
  : null;



  return (
    <div className="parameters-container">
      <h2>General Info</h2>

      <label>
        Beer Name:
        <input
          type="text"
          value={parameters.beerName}
          onChange={(e) => updateParameter('beerName', e.target.value)}
        />
      </label>

      <label>
        Style:
        <select
          value={parameters.style}
          onChange={(e) => updateParameter('style', e.target.value)}
        >
          <option value="">Select style</option>
          {styles && styles.map((s) => (
            <option key={s.number} value={s.number}>
              {s.number} - {s.name}
            </option>
          ))}
        </select>
      </label>


      <label>
        Batch Size (BBL):
        <input type="number" min="0"
          value={parameters.batchSize}
          onChange={(e) => updateParameter('batchSize', Number(e.target.value))}
        />
      </label>

      <label>
        Boil Loss (BBL):
        <input type="number" min="0"
          value={parameters.boilLoss}
          onChange={(e) => updateParameter('boilLoss', Number(e.target.value))}
        />
      </label>

      <label>
        Whirlpool Loss (BBL):
        <input type="number" min="0"
          value={parameters.whirlpoolLoss}
          onChange={(e) => updateParameter('whirlpoolLoss', Number(e.target.value))}
        />
      </label>

      <label>
        Knockout Loss (BBL):
        <input type="number" min="0"
          value={parameters.knockoutLoss}
          onChange={(e) => updateParameter('knockoutLoss', Number(e.target.value))}
        />
      </label>

      <label>
        Brew Date:
        <input
          type="date"
          value={parameters.brewDate}
          onChange={(e) => updateParameter('brewDate', e.target.value)}
        />
      </label>

      <label>
        Flag Type:
        <select
          value={parameters.flagType}
          onChange={(e) => updateParameter('flagType', e.target.value)}
        >
          <option value="">Select flag type</option>
          <option value="One-off">One-off</option>
          <option value="Seasonal">Seasonal</option>
          <option value="Flagship">Flagship</option>
        </select>
      </label>

      <label>
        Unique ID:
        <input
          type="text"
          value={parameters.uniqueId}
          onChange={(e) => updateParameter('uniqueId', e.target.value)}
        />
      </label>

      <h2>Gravity & Yield</h2>
      
      {avgOG && <p className="bjcp-inline">BJCP Avg OG:  {avgOG}°P</p>}
      
      <label>
        OG (°P):
        <input type="number" min="0"
          value={parameters.OG}
          onChange={(e) => updateParameter('OG', Number(e.target.value))}
        />
      </label>
      {avgTG && <p className="bjcp-inline">BJCP Avg TG:  {avgTG}°P</p>}

      <label>
        TG (°P):
        <input type="number" min="0"
          value={parameters.TG}
          onChange={(e) => updateParameter('TG', Number(e.target.value))}
        />
      </label>

      <label>
        {avgABV && <p className="bjcp-inline">BJCP Avg ABV%: {avgABV}%</p>}

        ABV (%):
        <input type="number" min="0"
          value={parameters.ABV !== null ? parameters.ABV.toFixed(2) : ''}
          readOnly
        />
      </label>

      <label>
        Boil Time (min):
        <input type="number" min="0"
          value={parameters.boilTime}
          onChange={(e) => updateParameter('boilTime', Number(e.target.value))}
        />
      </label>
      {avgIBU && <p className="bjcp-inline">BJCP Avg IBU: {avgIBU}</p>}
      <label>
        IBU:
        <input type="number" min="0"
          value={parameters.IBU}
          onChange={(e) => updateParameter('IBU', Number(e.target.value))}
        />
      </label>

      <label>
        Kettle Utilization:
        <input type="number" min="0" step="0.01"
          value={parameters.kettleUtilization}
          onChange={(e) => updateParameter('kettleUtilization', Number(e.target.value))}
        />
      </label>

      <label>
        {avgSRM && <p className="bjcp-inline">BJCP Avg SRM: {avgSRM}</p>}

        SRM:
        <input type="number" min="0"
          value={parameters.SRM}
          onChange={(e) => updateParameter('SRM', Number(e.target.value))}
        />
      </label>

      <label>
        Flavor Oil Load (mL/BBL):
        <input type="number" min="0" step="0.01"
          value={parameters.flavorOilLoad}
          onChange={(e) => updateParameter('flavorOilLoad', Number(e.target.value))}
        />
      </label>

      <label>
        Aroma Oil Load (mL/BBL):
        <input type="number" min="0" step="0.01"
          value={parameters.aromaOilLoad}
          onChange={(e) => updateParameter('aromaOilLoad', Number(e.target.value))}
        />
      </label>

      <h2>Water Chemistry</h2>

      <label>
        Water Source:
        <select
          value={parameters.waterSource}
          onChange={(e) => updateParameter('waterSource', e.target.value)}
        >
          <option value="">Select water source</option>
          {userWaterProfiles.map((p) => (
            <option key={p.id} value={p.id}>{p.profileName || p.id}</option>
          ))}
        </select>
      </label>

      <label>
        Desired Target Water Profile:
        <select
          value={parameters.desiredTargetWaterProfile}
          onChange={(e) => updateParameter('desiredTargetWaterProfile', e.target.value)}
        >
          <option value="">Select target profile</option>
          {waterProfiles.map((p) => (
            <option key={p.id} value={p.id}>{p.id}</option>
          ))}
        </select>
      </label>


      <h2>Fermentation Targets</h2>

      <label>
        Mash pH Target:
        <input type="number" min="0" step="0.01"
          value={parameters.mashPHTarget}
          onChange={(e) => updateParameter('mashPHTarget', Number(e.target.value))}
        />
      </label>

      <label>
        Fermentation Temp Target (°F):
        <input type="number" min="0" step="0.1"
          value={parameters.fermentationTempTarget}
          onChange={(e) => updateParameter('fermentationTempTarget', Number(e.target.value))}
        />
      </label>

      <label>
        Pressure Ferment?
        <select
          value={parameters.pressureFerment}
          onChange={(e) => updateParameter('pressureFerment', e.target.value)}
        >
          <option value="">Select option</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </label>

      <h2>Yeast</h2>

      <label>
        Yeast Strain:
        <select
          value={parameters.yeastStrain}
          onChange={(e) => updateParameter('yeastStrain', e.target.value)}
        >
          <option value="">Select yeast</option>
          {yeastProfiles.map((y) => (
            <option key={y.id} value={y.id}>
              {y.strainName || y.id}
            </option>
          ))}
        </select>
      </label>

      <label>
        Yeast Generation:
        <input type="number" min="0"
          value={parameters.yeastGeneration}
          onChange={(e) => updateParameter('yeastGeneration', Number(e.target.value))}
        />
      </label>

      <label>
        Attenuation Avg (%):
        <input type="number" min="0" max="100" step="0.1"
          value={parameters.attenuationAvg !== null ? parameters.attenuationAvg : ''}
          readOnly
        />
      </label>

      <label>
        Expected TG (°P):
        <input type="number" min="0" step="0.1"
          value={parameters.expectedTG !== null ? parameters.expectedTG.toFixed(1) : ''}
          readOnly
        />
      </label>

      <h2>Efficiency</h2>

      <label>
        Mash Efficiency:
        <input type="number" min="0" max="1" step="0.01"
          value={parameters.mashEfficiency}
          onChange={(e) => updateParameter('mashEfficiency', Number(e.target.value))}
        />
      </label>

      <label>
        Brewhouse Efficiency:
        <input type="number" min="0" max="1" step="0.01"
          value={parameters.brewhouseEfficiency}
          onChange={(e) => updateParameter('brewhouseEfficiency', Number(e.target.value))}
        />
      </label>

      <label>
        Lauter Efficiency:
        <input type="number" min="0" max="1" step="0.01"
          value={parameters.lauterEfficiency}
          onChange={(e) => updateParameter('lauterEfficiency', Number(e.target.value))}
        />
      </label>
    </div>
  );
};

export default Parameters;
