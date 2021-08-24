import React, { useState, useEffect } from "react";
import "antd/dist/antd.css";

import axios from "axios";

import {
 
  Card,
  Button,
  Modal,
  
} from "antd";

import FileInput from './FileInput.js'


function UploadAlt() {

    const [fileData, setfileData] = useState();
    
    const [fileDataContent, setfileDataContent] = useState(" ");

    function inputFileValue(file) {
        setfileData(file[0]);
        // console.log(file[0]);
      }

    

    return (
        <div>
        <Card
            style={{
            paddingTop: "40px",
            width: 386,
            paddingBottom: "20px",
            marginBottom: "20px"
            }}
        >
            <FileInput inputFileValue={inputFileValue} />

        
        </Card>
    </div>
    );
  }

  export default UploadAlt;