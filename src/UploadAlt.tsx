import React, { useState, useEffect } from "react";
import "antd/dist/antd.css";
import axios from "axios";
import { Card, Button, Modal } from "antd";
import FileInput from './FileInput'


function UploadAlt() {

    const [fileData, setfileData] = useState();
    const [isModalVisible, setIsModalVisible] = useState(false);    
    const [fileDataContent, setfileDataContent] = useState(" ");

    function fileContent(file) {
        setfileData(file[0]);
        // console.log(file[0]);
      }

      
      const handleSubmit = (e) => {
        const fr = new FileReader();
        fr.onload = function (e) {
          // e.target.result should contain the text
          const text = e.target.result;
          setfileDataContent(text);
          console.log(fileDataContent);
        };
        fr.readAsText(fileData);
        axios({
          method: "post",
          url: "",
          // database table with the columns Name, content
          data: [{ Name: fileData.name, content: fileDataContent }]
        })
          .then(function (response) {
            // handle success
            console.log(response.data);
          })
          .catch(function (error) {
            // handle error
            console.log(error);
          });
        };

      return (
        <div>
        <Card
            style={{
            paddingTop: "40px",
            width: 386,
            paddingBottom: "20px",
            marginBottom: "20px"
            }}>
            <FileInput fileContent={fileContent} />
            <Button type="primary" onClick={showModal} style={{marginTop: "50px"}}>
            Upload
            </Button>
            
        </Card>
    </div>
    );
  }
  export default UploadAlt;
