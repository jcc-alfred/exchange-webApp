import React from 'react';
import Banner from './Banner';
import Trading from './Trading';
import Introduction from './Introduction';
import News from './News';
import Coop from './Coop';

import '../../assets/Less/index.less';

export default class HomePage extends React.Component{
    toPage(url){
        this.props.history.push(url);
    }
    render(){
        return (
        <div className="container-fluid">
        
            <Banner />

            <Trading toPage={this.toPage.bind(this)}/>
                        
            <Introduction />

            <News toPage={this.toPage.bind(this)} />
            
            {/* <Coop /> */}

        </div>
        )
    }
}