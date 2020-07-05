import React from 'react';
import ReactDOM from 'react-dom';
import PivotTableUI from 'react-pivottable/PivotTableUI';
import 'react-pivottable/pivottable.css';
import HttpService from '../../util/HttpService.jsx';

// see documentation for supported input formats
const data = [['attribute', 'attribute2'], ['value1', 'value2']];

export default class assetCube extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          assetCube: []
          

      }

    }
    componentDidMount() {
      let url = "reportServer/assetquery/getAssetCube";
      HttpService.post(url, JSON.stringify({}))
          .then(res => {
              if (res.resultCode == "1000") {
                  this.setState({
                    assetCube: res.data,
                  });
              }
              else {
                  message.error(res.message);
              }
  
          });

    }
    
    



    render() {
        return (
            <PivotTableUI
                data={this.state.assetCube}
                onChange={s => this.setState(s)}
                {...this.state}
            />
        );
    }
}

