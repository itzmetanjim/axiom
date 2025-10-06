import logo from './logo.png';
import './App.css';
var hDivUUIDs = []
function LayerContainer({ children }) {
  return (
    <div className="absolute-container">
      {children}
    </div>
  );
}

function Layer ({children, z, className}) {
  return (
    <div className={`layer ${className || ''}`} style={{zIndex: z}}>
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

function Thingy({script,children,z,classNameInherit}) {
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
            <Divider type={type} className={classNameInherit}></Divider>
          </>
    }
    let after = <></>
    for (let j = th; j < count; j++) {
          after = <>
            <Divider type={type} className={classNameInherit}></Divider>
            {after}
          </>
    }
    const prev = prevFunction;
    let newFunction = ({children}) => prev({children:(
      <>
        {before}
        <Divider type={type} size={size} className={classNameInherit}> {children}</Divider>
        {after}
      </>)}
    )
    prevFunction = newFunction

  }
  return <Layer z={z} className={classNameInherit}>{prevFunction({children: children})}</Layer>;
}

function ThingyEach({script,children,z,dividerStyles}) {
  // This like Thingy but applies the children to each divider, not just the selected one.
  // Useful for making grids of things.
  let elems = script.split(";") // 16x,h,1;9x,v,1
  
  // Parse the script to get grid dimensions
  let gridStructure = [];
  for (let i = 0; i < elems.length; i++) {
    if (elems[i].trim() === "") { continue; }
    let parts = elems[i].split(",");
    let count = 0;
    let type = "";
    
    for (let j = 0; j < parts.length; j++) {
      parts[j] = parts[j].trim().toLowerCase();
      if (parts[j].endsWith("x")) {
        count = parseInt(parts[j].slice(0, -1));
      } else if (parts[j] === "v" || parts[j] === "h") {
        type = parts[j];
      }
    }
    
    if (count > 0 && type) {
      gridStructure.push({ count, type });
    }
  }
  
  // Build the grid recursively
  function buildGrid(structure, depth = 0) {
    if (depth >= structure.length) {
      return children;
    }
    
    const current = structure[depth];
    const dividers = [];
    
    for (let i = 0; i < current.count; i++) {
      dividers.push(
        <Divider key={i} type={current.type} style={dividerStyles}>
          {buildGrid(structure, depth + 1)}
        </Divider>
      );
    }
    
    return <>{dividers}</>;
  }
  
  return <Layer z={z}>{buildGrid(gridStructure)}</Layer>;
}

// eslint-disable-next-line
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
window.ColorModulo = 0;
function ColorOnHover(){
  let uuid = "colorOnHover" + crypto.randomUUID();
  let coloridx = Math.floor(Math.random()*6)
  let colorer = ()=>{
    let color = ["#e57373", "#64b5f6", "#81c784", "#fff176", "#ba68c8", "#ffb74d"][coloridx];
    let elem = document.getElementById(uuid);
    if (elem) {
      elem.style.transition = "background-color 0s ease"
      elem.style.backgroundColor = color;
      setTimeout(()=>{
        // revert to original color, with a smooth transition
        elem.style.transition = "background-color 0.5s ease";
        elem.style.backgroundColor = "black";
      }, 100);
    }
  }
  return <div id={uuid} onMouseOver={colorer} style={{width: '100%', height: '100%', backgroundColor: 'black', boxSizing: 'border-box', border: '3px solid black'}}></div>;
}
function ColoredRoundedSquare({color,radius,children}){
  return (
    <div
      style={{
        width: 'fit-content',
        height: 'fit-content',
        backgroundColor: color || 'rgba(0,0,0,0.3)',
        borderRadius: radius || '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {children}
    </div>
  );
}
//let logosrc = "logo.png"
function App() {
  return (
    <>
    <div className="App">
      
      <LayerContainer>
        <Thingy script={"3x,v,2;3x,h,2;2x,h,1"} z={1} className="clickthrough" classNameInherit="clickthrough">
          <ColoredRoundedSquare>
            <img src={logo} alt="Axiom Logo" width="400"></img>
          </ColoredRoundedSquare>
        </Thingy>
        <ThingyEach script={"16x,h,1;9x,v,1"} z={0} dividerStyles={{border: '3px solid black'}}>
          <ColorOnHover></ColorOnHover>
        </ThingyEach>
      </LayerContainer>
    </div>
    
    </>
  );
}

export default App;
