import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  loadResults,
  addLineToAxis, updateLineInAxis, removeLineFromAxis,
  updateAxisScale,
  updateResult
} from '../actions';
import ExperimentsTable from '../components/ExperimentsTable';
import LogVisualizer from '../components/LogVisualizer';


const resultsLoadInterval = 5 * 1000;

class ChainerUIContainer extends React.Component {
  componentWillMount() {
    this.props.loadResults();
  }

  componentDidMount() {
    this.resultsLoadTimer = setInterval(this.props.loadResults, resultsLoadInterval);
  }

  componentWillUnmount() {
    clearInterval(this.resultsLoadTimer);
  }

  render() {
    const { results, config, stats } = this.props;

    return (
      <div className="chainer-ui-container">
        <LogVisualizer
          results={results}
          stats={stats}
          config={config}
          onAxisConfigLineAdd={this.props.addLineToAxis}
          onAxisConfigLineUpdate={this.props.updateLineInAxis}
          onAxisConfigLineRemove={this.props.removeLineFromAxis}
          onAxisConfigScaleUpdate={this.props.updateAxisScale}
        />
        <ExperimentsTable
          results={results}
          stats={stats}
          onResultUpdate={this.props.updateResult}
        />
      </div>
    );
  }
}

const mapEntitiesToStats = (entities) => {
  const { results = {} } = entities;
  const argKeySet = {};
  Object.keys(results).forEach((resultId) => {
    const result = results[resultId];
    result.args.forEach((arg) => { argKeySet[arg.key] = true; });
  });
  const argKeys = Object.keys(argKeySet);

  const axes = {
    xAxis: {},
    yLeftAxis: {},
    yRightAxis: {}
  };

  return { axes, argKeys };
};

const defaultConfig = {
  axes: {}
};

const mapStateToProps = (state) => {
  const {
    entities,
    config = defaultConfig
  } = state;
  const { results = {} } = entities;
  const stats = mapEntitiesToStats(entities);
  return { results, config, stats };
};

ChainerUIContainer.propTypes = {
  results: PropTypes.objectOf(PropTypes.any).isRequired,
  config: PropTypes.shape({
    axes: PropTypes.objectOf(PropTypes.any)
  }).isRequired,
  stats: PropTypes.shape({
    axes: PropTypes.objectOf(PropTypes.any),
    argKeys: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  loadResults: PropTypes.func.isRequired,
  addLineToAxis: PropTypes.func.isRequired,
  updateLineInAxis: PropTypes.func.isRequired,
  removeLineFromAxis: PropTypes.func.isRequired,
  updateAxisScale: PropTypes.func.isRequired,
  updateResult: PropTypes.func.isRequired
};

export default connect(mapStateToProps, {
  loadResults,
  addLineToAxis,
  updateLineInAxis,
  removeLineFromAxis,
  updateAxisScale,
  updateResult
})(ChainerUIContainer);
