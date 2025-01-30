import { useState } from "react";

// import { Link } from 'react-router-dom';

export default function Button(props) {
    return (
      <button 
        onClick={props.onClick}
        id={props.id}
        type={props.type}
        className={`bg-blue-900 rounded-xl text-gray-50 py-4 px-8`}>
          {props.loading && <span>Loading Icon </span> }
          {props.text}
      </button>
    );
  }