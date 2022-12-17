

Removed unnecessary code from multi-flex-form module
Made it easier to use AlarmObject, by:
    1) Supporting initial parameters
    2) Allowing event callbacks to be invoked immediately
Improved layout of DualSwitch widget
Corrected a minor toggling bug with DualSwitch, cased when undefined, instead of false is passed as a value
Added loadWhilePromise() method to make developing better UX, more easy.
Removed use of deprecated method 'fire' 
Fixed naming issue with the continue-button widget
Improved error-report UI
Added styling for branded-popup scrollbar, which other components can take advantage of, to improve their UX, by giving a consistent scrollbar