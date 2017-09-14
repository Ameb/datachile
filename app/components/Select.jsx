import React, {Component} from "react";
import {connect} from "react-redux";
import {translate} from "react-i18next";

import "./Select.css";

class Select extends Component {

    constructor(props) {
      super(props);
      this.handleChange = this.handleChange.bind(this);
    };

    propTypes: {
        id: React.PropTypes.string.isRequired,
        options: React.PropTypes.array.isRequired,
        value: React.PropTypes.string,
        valueField: React.PropTypes.string,
        labelField: React.PropTypes.string,
        onChange: React.PropTypes.func
    };

    getDefaultProps() {
        return {
            value: null,
            valueField: 'value',
            labelField: 'label',
            onChange: null
        };
    };

    getInitialState() {
        var selected = this.getSelectedFromProps(this.props);
        return {
            selected: selected
        }
    };
    
    componentWillReceiveProps(nextProps) {
        var selected = this.getSelectedFromProps(nextProps);
        this.setState({
           selected: selected
        });
    };
    
    getSelectedFromProps(props) {
        var selected;
        if (props.value === null && props.options.length !== 0) {
            selected = props.options[0][props.valueField];
        } else {
            selected = props.value;
        }
        return selected;
    };

    render() {

        if(!this.state){
          return null;
        }

        const {id,options,valueField,labelField } = this.props;
        const {selected } = this.state;
        
        return (
            <select id={id} 
                    className='select-component' 
                    value={selected} 
                    onChange={this.handleChange}>
                {options && options.map(option =>
                  <option key={option[valueField]} value={option[valueField]}>
                      {option[labelField]}
                  </option>
                )}
            )}
            </select>
        )
    };

    handleChange(e) {
      const { onChange } = this.props;
      const { selected } = this.state;
        
      if (onChange) {
          var change = {
            oldValue: selected,
            newValue: e.target.value
          }
          onChange(change);
      }
      this.setState({selected: e.target.value});
    }
  
}

export default translate()(connect(state => ({}), {})(Select));
