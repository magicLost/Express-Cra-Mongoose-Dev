const { PerformanceObserver, performance } = require('perf_hooks');
 
/* OBSERVER SETUP */
const obs = new PerformanceObserver((items) => {
 
   /* RESULT LOG */
   const [ measure ] = items.getEntriesByName("My special benchmark");
   console.log(measure);
 
   performance.clearMarks();
});
 
obs.observe({ entryTypes: ['measure'] });
 
/* SETUP */

 
performance.mark('start');
 
/* EXERCISE */
const hello = "Hello";

if(true){
    const react = require('react');
}

 
performance.mark('end');
performance.measure("My special benchmark", 'start', 'end');