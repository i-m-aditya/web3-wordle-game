import React from 'react'
import { Router } from '@reach/router'

import App from '../App'
import Stake from '../Stake'
import Play from '../Play'

class Routes extends React.Component {
  render() {
    return (
      <Router>
        <App path="/" />
        <Stake path="/stake" />
        <Play path="/play" />
      </Router>
    )
  }
}

export default Routes
