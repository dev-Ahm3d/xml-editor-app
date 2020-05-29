const {ipcRenderer} = require('electron');
const fs = require('fs');
const util = require('util');
const format = require('xml-formatter');







 onOpen=()=>{
    ipcRenderer.send('odialog');

    ipcRenderer.on('ofile',(event,filePath)=>{
        fs.readFile(filePath,'UTF-8',(err,data)=>{
            document.getElementById('tArea').textContent=data;
        })  
    })
}







onSave=()=>{
    ipcRenderer.send('sdialog',document.getElementById('tArea').value);  
}








 checkValidation=()=>{

    let xmlCode=document.getElementById('tArea').value;
    
    let parser=new DOMParser();
let parserD=parser.parseFromString(xmlCode,'application/xml');
let PDerrorElement=parserD.querySelector('parsererror');
console.log(parserD)


let el=document.getElementById('d');

if(PDerrorElement){
    el.classList.remove(['alert-primary']);
    el.classList.add(['alert-danger'])
    let er=PDerrorElement.childNodes[1].innerHTML;
    let end=er.search('at');
el.innerHTML=er.slice(0,end); 

}else{
    el.classList.remove(['alert-danger']);
    el.classList.add(['alert-primary']);
    el.textContent='There Are No Errors';   
}
 }








 /**
  @param {string} xml XML DOM tree
 */
 
 function xml2Json(xml) {
     
    var el = {};
  
    if (xml.nodeType == 1) {
      
      if (xml.attributes.length > 0) {
        el["@attributes"] = {};
        for (var j = 0; j < xml.attributes.length; j++) {
          var attribute = xml.attributes.item(j);
          el["@attributes"][attribute.nodeName] = attribute.nodeValue;
        }
      }
    } else if (xml.nodeType == 3) {
      // text
      el = xml.nodeValue;
    }
  
    var textNodes = [].slice.call(xml.childNodes).filter(function(node) {
      return node.nodeType === 3;
    });
    if (xml.hasChildNodes() && xml.childNodes.length === textNodes.length) {
      el = [].slice.call(xml.childNodes).reduce(function(text, node) {
        return text + node.nodeValue;
      }, "");
    } else if (xml.hasChildNodes()) {
      for (var i = 0; i < xml.childNodes.length; i++) {
        var item = xml.childNodes.item(i);
        var nodeName = item.nodeName;
        if (typeof el[nodeName] == "undefined") {
          el[nodeName] = xml2Json(item);
        } else {
          if (typeof el[nodeName].push == "undefined") {
            var old = el[nodeName];
            el[nodeName] = [];
            el[nodeName].push(old);
          }
          el[nodeName].push(xml2Json(item));
        }
      }
    }
    return el;
  }





 convertToJSON=()=>{
    let xmlCode=document.getElementById('tArea').value.split('\n').join('').trim();
    var XmlNode = new DOMParser().parseFromString(xmlCode, 'text/xml');
    var convertedCode= xml2Json(XmlNode);
    document.getElementById('tArea').value=util.inspect(convertedCode, {depth: null}); 
 }




 formatCode=()=>{
  let parser=new DOMParser();
  let xmlCode=document.getElementById('tArea').value;
let parserD=parser.parseFromString(xmlCode,'application/xml');

    document.getElementById('tArea').value=format(parserD.documentElement.outerHTML,{
      indentation: '  ', 
      filter: (node) => node.type !== 'Comment', 
      collapseContent: false, 
      lineSeparator: '\r\n'
  });
   
}





formatCodeLineByLineFunction=(xmlCode)=>{
    let parser=new DOMParser();
let parserD=parser.parseFromString(xmlCode,'application/xml');

        let v=format(parserD.documentElement.outerHTML,{
          indentation: '  ', 
          filter: (node) => node.type !== 'Comment', 
          collapseContent: false, 
          lineSeparator: '\r\n'
      });

      let art=v.split('\n'); let tex='';
      
      for(let i=0;i<art.length;i++){
        if(art[i]=='') {
         art.splice(indexOf(art[i]),1);
        }
        else{
        art[i]=art[i].trim();
        tex=tex+art[i]+'\n';
        }
      }


      return tex;
      
}



formatCodeLineByLine=()=>{
  let v=formatCodeLineByLineFunction(document.getElementById('tArea').value);
  document.getElementById('tArea').value=v;
}
 




correctErrors=()=>{

let arrOfStrings=document.getElementById('tArea').value.split('\n');
for(let i=0;i<arrOfStrings.length;i++){
  arrOfStrings[i]=arrOfStrings[i].trim();
}


for(let i=0;i<arrOfStrings.length;i++){
  if(arrOfStrings[i]==="") {
    arrOfStrings.splice(arrOfStrings.indexOf(arrOfStrings[i]),1);
  }
}


  let arrOfTags=[];
  let whatInside=[];

  for(let i=0;i<arrOfStrings.length;i++){
      let x=arrOfStrings[i];

      // auto tag with no space
        if( x.substr(0,1)==='<' && x.substr(1,1)!=='/' && x.substr(x.length-1,1)==='>' &&x.substr(x.length-2,1)==='/' && x.search(' ')==-1 ) {  
          arrOfTags.push('$$'+x.slice(1,x.length-2));
          whatInside[i]=''; 
        }   

        // auto tag with space
        else if( x.substr(0,1)==='<' && x.substr(1,1)!=='/' && x.substr(x.length-1,1)==='>' &&x.substr(x.length-2,1)==='/' && x.search(' ')!=-1 ) {  
          let indexOfSpace=x.search(' ');  
          arrOfTags.push('$$'+x.slice(1,indexOfSpace));
          whatInside[i]=' '+x.slice(indexOfSpace+1,x.length-2);
        }   

      // opening tag has < and  > and has no space 
       else if( x.substr(0,1)==='<' && x.substr(1,1)!=='/' && x.substr(x.length-1,1)==='>' &&x.search(' ')==-1 ) {  
        arrOfTags.push(x.slice(1,x.length-1));
        whatInside[i]='';
 }   
      // opening tag has < and no > and has no space 
      else if( x.substr(0,1)==='<' && x.substr(1,1)!=='/' && x.substr(x.length-1,1)!=='>' &&x.search(' ')==-1 ) {  
          arrOfTags.push(x.slice(1));
          whatInside[i]=''; 
   }   


   // opening tag has < and > and has a space
   else if( x.substr(0,1)==='<' && x.substr(1,1)!=='/' && x.substr(x.length-1,1)==='>' &&x.search(' ')!=-1) {
     let indexOfSpace=x.search(' ');  
    arrOfTags.push(x.slice(1,indexOfSpace));
    whatInside[i]=' '+x.slice(indexOfSpace+1,x.length-1); 
}   



   // opening tag has < and no > and has a space
   else if( x.substr(0,1)==='<' && x.substr(1,1)!=='/' && x.substr(x.length-1,1)!=='>' &&x.search(' ')!=-1) {
    let indexOfSpace=x.search(' ');  
   arrOfTags.push(x.slice(1,indexOfSpace));
   whatInside[i]=' '+x.slice(indexOfSpace+1);
}   


// closing tag has < and > 
else if( x.substr(0,1)==='<' && x.substr(1,1)==='/' && x.substr(x.length-1,1)==='>'){
  arrOfTags.push(x.slice(2,x.length-1));
  whatInside[i]=''; 
}

   // closing tag has < and no > 
  else if( x.substr(0,1)==='<' && x.substr(1,1)==='/' && x.substr(x.length-1,1)!=='>' ) {  
       arrOfTags.push(x.slice(2));
       whatInside[i]=''; 
}   

// for words between tags
else if( x.substr(0,1)!=='<' && x.substr(1,1)!=='/' && x.substr(x.length-1,1)!=='>' ) {  
  arrOfTags.push('@'+x);
  whatInside[i]=''; 
}   

}


let text='';
let done=[];

for(let i=0;i<arrOfTags.length;i++){
  
   
  if (arrOfTags[i][0]=='$' &&arrOfTags[i][1]=='$') {
    text=text+'<'+arrOfTags[i].slice(2)+whatInside[i]+'/>'+'\n'; 
  }

  else if(done.indexOf(arrOfTags[i])==-1 &&arrOfTags[i][0]!='@' &&arrOfTags[i][0]!='$') {
    text=text+'<'+arrOfTags[i]+whatInside[i]+'>'+'\n';
    done.push(arrOfTags[i]);
  
  }


  else if(arrOfTags[i][0]=='@'){
    text=text+arrOfTags[i].slice(1)+whatInside[i]+'\n';
  }

  
  else if(done.indexOf(arrOfTags[i])>-1 &&arrOfTags[i][0]!='@' &&arrOfTags[i][0]!='$') {
    text=text+'</'+arrOfTags[i]+whatInside[i]+'>'+'\n';
    done.splice(done.indexOf(arrOfTags[i]),1);
  }


  
}

  

  document.getElementById('tArea').value=text;
}







countSynsets=()=>{

  let text=formatCodeLineByLineFunction(document.getElementById('tArea').value);
  let textArray=text.split('\n');
  let c=0;
  for(let i=0;i<textArray.length;i++){
    if(textArray[i].slice(0,7)=='<synset' &&textArray[i].slice(0,8)!='<synsets') c=c+1;
  }


  let el=document.getElementById('d');
  el.classList.remove('alert-danger');
  el.classList.add('alert-primary');
  el.textContent=c;
}


getDefAndHypers=()=>{
  let text=formatCodeLineByLineFunction(document.getElementById('tArea').value);
  let textArray=text.split('\n');
  let w=document.getElementById('word').value;
  let theDef='',theHypers='';

  for(let i=0;i<textArray.length;i++){
    if(w==textArray[i]) {
      for(let y=i;y<textArray.length;y++){
        if(textArray[y]=='<def>'){
          theDef=theDef+textArray[y+1]+' ';
        }
        if(textArray[y]=='</synset>') break;
      }
      break;
    }
  }

  for(let i=0;i<textArray.length;i++){
    if(w==textArray[i]) {
      for(let y=i;y<textArray.length;y++){
        if(textArray[y].slice(0,16)=='<pointer refs="n'){
         
           theHypers=theHypers+'<br>'+'-'+textArray[y+1];
        }

        if(textArray[y]=='</synset>') break;
      
      }
      
      break;
    }
    

  }

  let el=document.getElementById('d');
  el.classList.remove('alert-danger');
  el.classList.add('alert-primary');

 el.innerHTML='The Definition = '+ theDef +'<br>'+'<br>'+'The Hypernymes = ' +theHypers ;
}