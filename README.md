# WinchJS #

This is a lazy image loader written for AngularJS.

Current versions of angular supported are 1.0 to 1.3

## Usage ##
When the window scrolls or triggers a validation event a check occurs. If an edge of an image is within 100 pixels of 
the visible page, the content is placed and loaded into the web page.  If there are any other images that have the 
same URL they are also loaded.

Example:

```

<div winch-master>
<div winch-img="http://placehold.it/200x200></div>
</div>

```

### Testing ###
Winch has a full test suite.  If you want to submit a pull request make sure the test suite passes or is updated.


Run:
```

npm test

```
