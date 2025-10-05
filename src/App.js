import logo from './logo.svg';
import './App.css';
var hDivUUIDs = []
function LayerContainer({ children }) {
  return (
    <div className="absolute-container">
      {children}
    </div>
  );
}

function Layer ({children, z}) {
  return (
    <div className="layer" style={{zIndex: z}}>
      {children}
    </div>
  );
}

function Divider({type, children, size}) {
  let lsize = ""
  if (!size || size === undefined || size === null) {
    lsize = "1";
  }else{
    lsize = size.toString();
  }
  
  
  if (type ==="h"){
    const uuid = "dividerUUID" + crypto.randomUUID();
    return (
      <div style={{width: '100%', flex: lsize}} id={uuid}>{children}</div>
    );
  } else if (type === "v") {
    const uuid = "dividerUUID" + crypto.randomUUID();
    hDivUUIDs.push(uuid);
    localStorage.setItem("hDivUUIDs", JSON.stringify(hDivUUIDs));
    return (
      <div
        style={{height: '100%', flex: lsize }}
        id={uuid}
        onLoad={(e) => {
          const parent = e.target.parentElement;
          if (parent) {
            parent.style.flexDirection = "column";
          }
        }}
      >
        {children}
      </div>
    );
  } else {
    return (
      <div style={{height: '100%', width: '100%', flex: lsize}}>{children}</div>
    );
  }
}

function Thingy({script,children,z}) {
  let elems = script.split(";") // 3x,v,2,1s;3x,h,2,3s
  let prevFunction = ({children}) => (<>{children}</>)
  for (let i = 0; i < elems.length; i++) {
    if (elems[i].trim() === "") { continue; }
    let parts = elems[i].split(",") // 3x,v,2,1s // x is count, v/h is type, <number> is order s is size. 
    // 3x,v,2,1s says "make 3 vertical dividers, select the 2nd one, and make it size 1, then return the selected one"
    let count = 0
    let type = ""
    let th = 0
    let size = 1
    for (let i = 0; i < parts.length; i++) {
      parts[i] = parts[i].trim().toLowerCase();
      if (parts[i].endsWith("x")) {
        count = parseInt(parts[i].slice(0, -1))
      } else if (parts[i] === "v" || parts[i] === "h") {
        type = parts[i]
      } else if (parts[i].endsWith("s")) {
        size = parseInt(parts[i].slice(0, -1))
      } else {
        th = parseInt(parts[i])
      }
    }
    if (count <= 0 || th <= 0) { return (<><div>ERROR at script: {script}<br/>at nest index {i}, fragment {parts[i]}.<br/>Parsed:<br/> count: {count} type: {type} th/order: {th} size: {size}<br/>Both count (3x,4x,etc) and th/order (1,2,3) must be specified and positive integers, all others are optional. </div></>)}
    let before = <></>
    for (let j = 1; j < th; j++) {
          before = <>
            {before}
            <Divider type={type}></Divider>
          </>
    }
    let after = <></>
    for (let j = th; j < count; j++) {
          after = <>
            <Divider type={type}></Divider>
            {after}
          </>
    }
    const prev = prevFunction;
    let newFunction = ({children}) => prev({children:(
      <>
        {before}
        <Divider type={type} size={size}> {children}</Divider>
        {after}
      </>)}
    )
    prevFunction = newFunction

  }
  return <Layer z={z}>{prevFunction({children: children})}</Layer>;
}

function ThingyEach({script,children,z,dividerStyles}) {
  // This like Thingy but applies the children to each divider, not just the selected one.
  // Useful for making grids of things.
  let elems = script.split(";") // 3x,v,2,1s;3x,h,2,3s
  let prevFunction = ({children}) => (<>{children}</>)
  for (let i = 0; i < elems.length; i++) {
    if (elems[i].trim() === "") { continue; }
    let parts = elems[i].split(",") // 3x,v,2,1s // x is count, v/h is type, <number> is order s is size. 
    // 3x,v,2,1s says "make 3 vertical dividers, select the 2nd one, and make it size 1, then return the selected one"
    let count = 0
    let type = ""
    let th = 0
    let size = 1
    for (let i = 0; i < parts.length; i++) {
      parts[i] = parts[i].trim().toLowerCase();
      if (parts[i].endsWith("x")) {
        count = parseInt(parts[i].slice(0, -1))
      } else if (parts[i] === "v" || parts[i] === "h") {
        type = parts[i]
      } else if (parts[i].endsWith("s")) {
        size = parseInt(parts[i].slice(0, -1))
      } else {
        th = parseInt(parts[i])
      }
    }
    if (count <= 0 || th <= 0) { return (<><div>ERROR at script: {script}<br/>at nest index {i}, fragment {parts[i]}.<br/>Parsed:<br/> count: {count} type: {type} th/order: {th} size: {size}<br/>Both count (3x,4x,etc) and th/order (1,2,3) must be specified and positive integers, all others are optional. </div></>)}
    let before =({children})=>(<>{children}</>)
    for (let j = 1; j < th; j++) {
          before =({children})=>( <>
            {before(children)}
            <Divider type={type} style={dividerStyles}>{children}</Divider>
          </>)
    }
    let after =({children})=>(<>{children}</>)
    for (let j = th; j < count; j++) {
          after =({children})=>( <>
            <Divider type={type} style={dividerStyles}>{children}</Divider>
            {after(children)}
          </>)
    }
    const prev = prevFunction;
    let newFunction = ({children}) => prev({children:(
      <>
        {before({children:children})}
        <Divider type={type} size={size} style={dividerStyles}> {children}</Divider>
        {after({children:children})}
      </>)}
    )
    prevFunction = newFunction

  }
  return <Layer z={z}>{prevFunction({children: children})}</Layer>;
}

function MathEq({func, x1, x2, y1, y2, width, height, strokeWidth, color}) {
  let resolution = 1000;
  let step = (x2 - x1) / resolution;
  let points = [];
  for (let i = 0; i <= resolution; i++) {
    let x = x1 + i * step;
    let y = func(x);
    points.push([x, y]);
  }
  // Calculate viewBox from x1, y1, x2, y2
  const viewBox = `${x1} ${y1} ${x2 - x1} ${y2 - y1}`;
  return (
    <svg width={width} height={height} viewBox={viewBox} xmlns="http://www.w3.org/2000/svg">
      <polyline
        fill="none"
        stroke={color || "black"}
        strokeWidth={strokeWidth || 2}
        points={points.map(p => `${p[0]},${p[1]}`).join(" ")}
      />
    </svg>
  );
}


function App() {
  return (
    <>
    <div className="App">
      
      <LayerContainer>
        <Thingy script={"3x,v,2;3x,h,2"} z={1}>
          <h1>Welcome to Axiom!</h1>
          
        </Thingy>
        <ThingyEach script={"16x,h,1;9x,v,1"} z={0} dividerStyles={{border: '3px solid black'}}>
          a
        </ThingyEach>
      </LayerContainer>
    </div>
    
    </>
  );
}

export default App;
