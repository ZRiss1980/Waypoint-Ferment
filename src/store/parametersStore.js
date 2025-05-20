import { create } from 'zustand';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';

const defaultToday = dayjs().format('YYYY-MM-DD');

const defaultParameters = {
  beerName: '',
  style: '',
  batchSize: 15,
  boilLoss: 1,
  whirlpoolLoss: 0.5,
  knockoutLoss: 0.5,
  brewDate: defaultToday,
  flagType: '',
  uniqueId: `BATCH-${nanoid(6).toUpperCase()}`,
  OG: 12,
  TG: 2,
  ABV: null,
  boilTime: 90,
  IBU: 25,
  kettleUtilization: 0.98,
  SRM: 4,
  flavorOilLoad:.3,
  aromaOilLoad:.4,
  waterSource: '',
  desiredTargetWaterProfile: '',
  yeastStrain: '',
  yeastGeneration: 0,
  attenuationAvg: null,
  expectedTG: null,
  mashTemp: 150,
  liquorToGristRatio: 2,
  styleCategory: '',
  mashPHTarget: 5.2,
  grainAbsorptionRate: 0.5,
  fermentationTempTarget: 68,
  pressureFerment: false,
  fermentationDays: 7,
  finalPH: null,
  mashEfficiency: 0.85,
  brewhouseEfficiency: 0.8,
  lauterEfficiency: 0.95,
  systemLossLiters: 75,
  finalWortYieldLiters: 75,
  carbonationLevel: 2.4,
  maturationTimeDays: 3,
  tankDays: null,
  isDirty: false // to track unsaved state
};

export const useParametersStore = create((set) => ({
  parameters: { ...defaultParameters },

  updateParameter: (key, value) =>
    set((state) => {
      console.log(`🧬 updateParameter called: ${key} =`, value);
      return {
        parameters: {
          ...state.parameters,
          [key]: value,
          isDirty: true,
        },
      };
    }),

  resetParameters: () =>
    set(() => ({ parameters: { ...defaultParameters } })),

  markClean: () =>
    set((state) => ({ parameters: { ...state.parameters, isDirty: false } }))
}));
