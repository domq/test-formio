'use strict';

import React from 'react';
import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom';
import { render } from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { ReactiveVar } from 'meteor/reactive-var';

import '../imports/startup/accounts-config.js';
import App from '../imports/ui/App.js';

function tuto2 (target) {
  class Clock extends React.Component {
    // React-style state: object-oriented, mutable, owned, "private"
    // (actually just obfuscated by convention)
    constructor(props) {
      super(props);
      this.state = {date: new Date()};
    }

    componentDidMount() {
      this._timerID = setInterval(
        () => this.tick(),
        1000
      );
    }

    componentWillUnmount() {
      clearInterval(this._timerID);
    }

    tick () {
      console.log('tick')
      this.setState({date: new Date()});
    }

    render() {
      return (
        <div>
          <h1>Hello, world!</h1>
          <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
        </div>
      );
    }
  }
  let c = <Clock/>
  console.log(c)
  ReactDOM.render(c, target);
}

// Meteor-style state: functional, doesn't need any kind of ownership
// relationship thanks to Tracker-style pub-sub
function newClock () {
  console.log('newClock()');
  const clockVar = new ReactiveVar(new Date());
  let nextTickIsTock = false;
  let timer;

  return {
    get () {
      const theTime = clockVar.get();
      console.log('Time is now ', theTime);
      return theTime;
    },
    tick () {
      if (nextTickIsTock) {
        console.log('tock');
      } else {
        console.log('tick');
      }
      nextTickIsTock = ! nextTickIsTock;
      clockVar.set(new Date());
    },
    start () { timer = setInterval(this.tick, 1000) },
    stop () { clearInterval(timer); timer = null }
  }
}

function tuto3 (target) {
  class Clock extends React.Component {
    render() {
      return (
        <div>
          <h1>Hello, world!</h1>
          <ul>{this.props.verses.map( verse => (
            <li key={verse._id}>{verse.text}</li>
            ))}</ul>
          <h2>It is {this.props.time.toLocaleTimeString()}.</h2>
        </div>
      );
    }
  }

  Clock = withTracker( function(props) {
    // This function is run by Meteor's Tracker as a reactive computation
    console.log("withTracker: (re)constructing Clock component from ", props)

    const time = props.clock.get()

    // Computation stops here; but it will be called again by Tracker
    // whenever appropriate, resulting in the Clock component being
    // constructed anew (with different props)
    // Note: framework automatically merges the return value into props,
    // just like React's setState() does.
    return { time };

    // React says: props cannot be mutable, so we can't just do
    //   return { clock }
    // and expect calls to prop.clock.get() to reactively update in
    // the component.
  })(Clock);

  // If you listen to the Meteor documentation, it will have you
  // construct reactive data sources (i.e. Meteor.subscribe()) from
  // within the withTracker() callback. This is wrong - you want to do
  // that only once per (wrapped) <Clock> getting constructed, like
  // here. (The tutorial's approach only happens to work thanks to
  // subscriptions being cached in the Meteor code.)
  const clock = newClock()
  clock.start()

  ReactDOM.render(
    <Clock clock={clock} verses={[
             {_id: 1, text: "How are you gentlemen"},
             {_id: 2, text: "All your base are belong to us"}
           ]}/>, target);
}

Meteor.startup(() => {
  const target = document.getElementById('render-target');
  // render(<App />, target);
  tuto3(target);
});
