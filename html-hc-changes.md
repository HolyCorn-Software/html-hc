.

Added delayed-action utility, which allows orderly access to functions

Added back-forth widget to allow easier navigation within UIs

Improved typing of popup-form widget

Improved UX of search-input widget, by padding it, since multi-flex-form has removed the default spaces

Added defineImageProperty() method, which provides a better way of handling images.
Images may be automatically handled as inline images, background-images, or inline svgs

Corrected minor bug with the way AlarmObject proxies functions

Solved some animation bugs with the slide-container widget

Fixed minor callback bug, in pluralWidgetProperty.

Removed unnecessary logging

Added two (2) updates to slide-container widget
    1) an update that makes the index internally update, when the array of screens has changed. 
    2) an update to make the slider animate by sliding forward, if the old index is the same as the new index, but the element being added was not know before
These updates is very important to permitting the slide-container be used in combinary with the novel backforth widget

Corrected a minor bug with popup-menu, where a popup can be closed before it shows, leading to an unstable unrecoverable state