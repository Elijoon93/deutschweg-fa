/*
  DeutschWeg production configuration.
  Cross-user analytics is disabled until one provider is configured.
  Do not place private secrets in this public GitHub Pages file.
*/
window.DEUTSCHWEG_CONFIG={
  release:'14.8.0-rc.1',
  analytics:{
    ga4MeasurementId:'',
    plausibleDomain:'',
    plausibleScript:'https://plausible.io/js/script.js',
    endpoint:''
  },
  privacy:{collectPersonalData:false,anonymousInstallId:true}
};
