# WinchJS [![Build Status](https://travis-ci.org/GeneralElectric/winchjs.svg?branch=master)](https://travis-ci.org/GeneralElectric/winchjs)

This is a lazy image loader written for AngularJS.

Current versions of angular supported are 1.0 to 1.3.  It should work with IE9+ and modern versions of other browsers.

## Usage
When the window scrolls or triggers a validation event a check occurs. If an edge of an image is within 100 pixels of 
the visible page, the content is placed and loaded into the web page.  If there are any other images that have the 
same URL they are also loaded.

Basic Example:

```
<div winch-master>
<div winch-img src="http://placehold.it/200x200></div>
</div>

```

### Winch Master 
The directive winchMaster attaches monitoring to the window for scrolling and resizing.  If the window is scrolled 
or re-sized the master will request a validation through the Throttle service.  The winchMaster directive also can take 
in a comma delimited string of selectors.  This needs to be a string value, and not a function call.  These selectors 
are then processed on load and event listeners are added for scrolling.

### Winch Image 
The directive winchImg is the visual component.  It takes in parameters for the URL of the target image.  It also 
allows for a function to be passed in under img-loaded, which is called when the image element is added to the page.  
WinchImg also has two classes which are applied.  A compiled, but not loaded img will have 'winch-img-not-loaded' as an 
applied class. A loaded image will have 'winch-img-loaded' as an applied class.

### Winch Scroll Trigger 
The directive winchScrollTrigger can be attached to any element to bind scroll events that should trigger a image 
validation.  It also watches CSS transition events, and triggers a validation on start and end of the transitions.  It 
allows for a comma separated list of selectors.  These selectors will be queried on children of the instantiated HTML 
element.  These selectors are then processed on load and event listeners are added for scrolling and transitions.

### Winch Factory 
The factory winchFactory stores the references to all the winchImg directives and their validate and load functions.
This factory allows for the registering of iamges, triggering of validation directly, and loading all images with a 
specific URL.

### Winch Throttle 
The service Throttle provides the ability to group multiple sets fo the same call into one call, with a time delay.  An 
example of this is the scroll event.  It may be called many times for each 100ms throttled block.  This reduces CPU usage 
by only causing the images to validate once for every 100ms.


### Testing 
Winch has a full test suite.  If you want to submit a pull request make sure the test suite passes or is updated.

Run:
```
npm test
```
