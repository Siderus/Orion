import Spinner from 'spin.js'

var target = document.getElementById('host')
new Spinner().spin(target)

// After the spinner is rendered, we require the actual component
setTimeout(() => require('./renderer.jsx'), 0)
