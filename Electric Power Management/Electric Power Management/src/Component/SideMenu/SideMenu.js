import React from 'react'

const sideMenu = () => {
    return (
        <div className="bg-light border-right" id="sidebar-wrapper">
            <div className="sidebar-heading">LECO</div>
            <div className="list-group list-group-flush">
                <a className="list-group-item list-group-item-action bg-light"><label className="float-left" style={{"padding": 0,"margin-bottom": 0}}>Dashboard</label></a>
                <a className="list-group-item list-group-item-action bg-light"><label className="float-left" style={{"padding": 0,"margin-bottom": 0}}>Maps</label></a>
                <a className="list-group-item list-group-item-action bg-light"><label className="float-left" style={{"padding": 0,"margin-bottom": 0}}>Calendar</label></a>
                <a className="list-group-item list-group-item-action bg-light"><label className="float-left" style={{"padding": 0,"margin-bottom": 0}}>Settings</label></a>
                <a className="list-group-item list-group-item-action bg-light"><label className="float-left" style={{"padding": 0,"margin-bottom": 0}}>Profile</label></a>
            </div>
        </div>
    )
}

export default sideMenu
