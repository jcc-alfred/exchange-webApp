import React from  'react';

export default class Loading extends React.Component{
    constructor(props){
        super(props);
        this.height = window.innerHeight/2-100
        this.delay = 200;
        this.state = {display:'none'};

        this.clear = null;
    }

    show(){
        this.clear = setTimeout(()=>{
            this.setState({display:'block'})
        },this.delay)
    }
    hide(){
        this.setState({display:'none'})
        clearTimeout(this.clear);
    }

    render(){
        return <div className="loadingBox" style={{display:this.state.display}} >
            <div  className="imgBox" style={{textAlign:"center",marginTop:this.height}} ><img alt="" src={require('../../assets/img/loading.gif')} /></div>
        </div>
    }
}
