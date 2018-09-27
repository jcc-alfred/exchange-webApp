import React from  'react';

export default class Loading extends React.Component{
    render(){
        if(this.props.error) {
            return <div>Error! <button onClick={ this.props.retry }>Retry</button></div>;
        }
        else if (this.props.timedOut) {
            return <div>Taking a long time... <button onClick={ this.props.retry }>Retry</button></div>;
        }
        else if (this.props.pastDelay) {
            return <div>Loading...</div>;
        }
        else{
            return null;
        }
    }
}
