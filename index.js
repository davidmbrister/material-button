/*========================================================* 
* C H A P T E R    O N E / T W O
* 
*  *========================================================*/


/* this confusion:
In the following from early in the book (pg?) 
this is erroneously inferred to refer to the function object foo.
Actually, it refers to the global window object unless it's bound to another context object 
(is that the right way to summarize this?)
*/

function foo(num) {
    console.log(" foo: " + num);

    this.count++;
}

foo.count = 0;

var i;
for (i = 0; i < 10; i++) {
    if (i < 5) {
        foo(i)
    }
}

console.log(foo.count);


//https://www.w3schools.com/js/js_arrow_function.asp
/* The difference between this in a arrow as opposed to a regular funcion
is that this in an => will refer to the owner of the definition of the arrow function
(the object that defines the function, window if it's at the top-level scope)

A regular function has it's this bound to its caller (context object?) which
can be defined in several ways (refer to first to chapters for 4 ways to determine this)
*/

// explicit mixin DON'T DO ANY OF THIS 
function mixin( sourceObj, targetObj ) {
    for (var key in sourceObj) {
        //only copy if not present
        if (!(key in targetObj)) {
            targetObj[key] = sourceObj[key];
        }
    }
    return targetObj;
}

var Vehicle = {
    engines: 1,

    ignition: function() {
        console.log( "Turning on my engine..." );
    },

    drive: function() {
        this.ignition();
        console.log( "Steering and moving forward! " );
    }
}

var Car = mixin(Vehicle, {
    wheels: 4,

    drive: function() {
        // "explicit pseudopolymorphism". Explicit because of call() and pseudopolymorphic because it's
        // calling its "super" method (overridden method) by referring to it quite explicitly with Vehicle.<method>.call(this) (hardcoded absolute name). 
        // this is an absolute reference (literally naming the exact function and where it is) whereas
        // super() in OOP languages is relative and knows to draw on the super class because of the implicit 
        // relationship given by class inheritance
        Vehicle.drive.call( this ); // this line seems silly and forcing the pattern?
        console.log( "Rolling on all " + this.wheels + " wheels! " );
    }
})

Vehicle.drive(); // Turning  on my engine... Steering and moving forward!

Car.drive(); // Turning  on my engine... Steering and moving forward! Rolling on all 4 wheels!

Car.engines = 100;
Car.ignition = function() {
    console.log( "Turning on my CAR engine..." );
}

console.log(Car.engines + " " + Vehicle.engines)
Vehicle.drive(); // Turning  on my engine... Steering and moving forward!

Car.drive(); // Turning  on my engine... Steering and moving forward! Rolling on all 4 wheels!


/* BUTTON WIDGET EXAMPLE (p. 126) */
// Class-like without ES6 classes
// parent class
function Widget(width, height){
    this.width = width || 50;
    this.height = height || 50;
    this.elem = null; // abstract, can't be initialized with elem
}

Widget.prototype.render = function(where){
    if (this.elem) {
        this.elem.style.width = this.width + "px";
        this.elem.style.height = this.height + "px";
    }
    if (where instanceof HTMLElement) where.appendChild(this.elem);
}

// Child class
function Button(width, height, label) {
    // "super" constructor call
    Widget.call(this, width, height);
    this.label = label || "Default";
    this.elem = document.createElement("button");
    this.elem.innerHTML = this.label;
}

// make button "inherit" from Widget
Button.prototype = Object.create( Widget.prototype );

//"override" base render
Button.prototype.render = function render(where) {
    // "super" call
    Widget.prototype.render.call(this, where);
    this.elem.addEventListener("click", this.handleClick.bind(this), false)
}

Button.prototype.handleClick = function() {
    console.log("Button " + this.label + " clicked!");
}
/* var body = document.querySelector("body");
var btn1 = new Button (125, 30, "Hello")
var btn2 = new Button (170, 50, "Woprld")

btn1.render(body);
btn2.render(body); */

// Delegation Method which is tune with natural JS prototype delegation
var Widget = {
    init: function(width, height) {
        this.width = width || 50;
        this.height = height || 50;
        this.elem = null; // abstract, can't be initialized with ele
    },
    insert: function (where) {
        if (this.elem) {
            this.elem.style.width = this.width + "px";
            this.elem.style.height = this.height + "px";
        }
        if (where instanceof HTMLElement) where.appendChild(this.elem);
    }
}

var Button = Object.create( Widget );

Button.setup = function(width, height, label){
    // delegated call (hidden API calls require new developers to look up to the delegated prototype)
    this.init( width, height );
    this.label = label || "Default";
    this.elem = document.createElement("button");
    this.elem.innerHTML = this.label;
    // N.B.: (as below) a function inside a function doesn't retain the this ref and reverts to the Window/Global Object 
    (function(){console.log("Inside inside Button.setup" + this)}());
}

Button.build = function(where) {
    this.insert(where);
    this.elem.addEventListener("click", this.handleClick.bind(this), false)
}

Button.handleClick = function() {
    console.log("Button " + this.label + " clicked! The this.elem and this is " + this.elem + " " + JSON.stringify(this));
    console.log(this)
}

var StyledButton = Object.create( Button )

var materialUI = 
{ width: "150px",
    marginRight: "1em",
    position: "relative",
    height: "50px",
    border: "none",
    background: "#F85F73",
    color: "#FBE8D3",
    boxShadow: "0 0 10px 0.5px rgba(transparent, 0)",
    transition: "all 0.15s linear",
    cursor: "pointer",
    pseudoRules: {"onmouseover": {"transform": "scale(0.98)"}}
}

StyledButton.addStyles = function(styles) {
    console.log(this)

    // WHY SHOULD I HAVE TO DO THIS (below) 
    // TODO check if the book explains this

    let myThis = this;
    Object.keys(styles).forEach(function(key,index) {
        // key: the name of the object key
        
            if ((key) == "pseudoRules") {
                let pseudoruleKeys = Object.keys(styles.pseudoRules)
                for(let i = 0; i < pseudoruleKeys.length; i++) {
                    let evt = styles.pseudoRules[pseudoruleKeys[i]];
                    switch (pseudoruleKeys[i]) {
                        // &:hover pseudo rule emulation with javascript -- this is awful
                        case "onmouseover" : myThis.elem.onmouseover = function(){
                            Object.keys(evt).forEach(function(key,index) {
                                myThis.elem.style[`${key}`] = evt[`${key}`];
                            })
                            myThis.elem.onmouseout = function(){
                                Object.keys(evt).forEach(function(key,index) {
                                    if (Object.keys(styles).includes(evt[`${key}`])) {
                                        myThis.elem.style[`${key}`] = styles[evt[`${key}`]]
                                    } else {
                                        myThis.elem.style[`${key}`] = '';
                                    }
                                })
                            }
                        }
                    }            
                }
                // index: the ordinal position of the key within the object 
            } else {
                myThis.elem.style[`${key}`] = styles[key]
            }
            
    })
}

var ScriptedStyledButton = Object.create( StyledButton )

ScriptedStyledButton.prepMUIButton = function(width, height, label){
    // delegated call to init (hidden API calls require new developers to look up to the delegated prototype)
    this.init( width, height );
    this.label = label || "Default";
    this.elem = document.createElement("button");
    this.elem.innerHTML = this.label;
    this.elem.appendChild(elt("div", {
        class: 'MUIripple',
    }))
    // get the x/y offset from the document origin of this.elem and return top/left values
    this.elem.getOffset = function (element)
    {
        if (!element.getClientRects().length)
        {
          return { top: 0, left: 0 };
        }
    
        let rect = element.getBoundingClientRect();
        let win = element.ownerDocument.defaultView;
        return (
        {
          top: rect.top + win.pageYOffset,
          left: rect.left + win.pageXOffset
        });   
    }
    // create a growing circle on the element 
    this.elem.createRipple = function(y, x, target){
        const ripple = `<div class="MUIcircle" style="top:${y}px;left:${x}px;"></div>`;
        console.log(x);
        const _ripple = ripple;
        target.insertAdjacentHTML('beforeend', _ripple);
        setTimeout(() => document.querySelector('.MUIcircle').remove(), 720);
    }
    // trigger animation
    this.elem.onclick = function(e){
        const offset = this.getOffset(e.target);
        console.log("offset: " + offset)
        this.createRipple(e.pageY - offset.top, e.pageX - offset.left, e.target);
      };
    // N.B.: (as below) a function inside a function doesn't retain the this ref and reverts to the Window/Global Object 
    (function(){console.log("Inside inside Button.setup" + this)}());
}

// MAIN
var body = document.querySelector("body");
//var btn1 = Object.create( Button )
//btn1.setup(125, 30, "Hello")
var btn3 = Object.create( ScriptedStyledButton )
btn3.prepMUIButton(200, 50, "Hello")
//btn1.build(body);
btn3.build(body);
btn3.addStyles(materialUI);

var btn2 = Object.create( ScriptedStyledButton )
btn2.prepMUIButton(157, 78, "World")
//btn1.build(body);
btn2.build(body);
btn2.addStyles(materialUI);

// DOM-builder helper 
function elt(name, attrs, ...children) {
let dom = document.createElement(name);
for (let attr of Object.keys(attrs)) {
    dom.setAttribute (attr, attrs[attr]);
}
for (let child of children) {
    dom.appendChild(child)
}
return dom;
}