import React, { useEffect } from 'react';
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
      <div style={{ flex: lsize}} id={uuid} class="Divider DividerH">{children}</div>
    );
  } else if (type === "v") {
    const uuid = "dividerUUID" + crypto.randomUUID();
    hDivUUIDs.push(uuid);
    localStorage.setItem("hDivUUIDs", JSON.stringify(hDivUUIDs));
    return (
      <div
        style={{ flex: lsize }}
        id={uuid}
        class="Divider DividerV"
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
  let elems = script.split(";") // 16x,h,1;9x,v,1
  
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
        elem.style.transition = "background-color 0.5s ease"; 
        elem.style.backgroundColor = "black";
      }, 100);
    }
  }
  return <div id={uuid} onMouseOver={colorer} style={{width: '100%', height: '100%', backgroundColor: 'black', boxSizing: 'border-box', border: '3px solid black'}}></div>;
}
function ColoredRoundedSquare({color,radius,children,marginLeft,marginRight,pointerEvents}){
  if (marginLeft === undefined) { marginLeft = 'auto'; }
  if (marginRight === undefined) { marginRight = 'auto'; }
  if (pointerEvents === undefined) { pointerEvents = 'none'; }
  return (
    <div
      style={{
        width: 'fit-content',
        height: 'fit-content',
        backgroundColor: color || 'rgba(0,0,0,0.3)',
        borderRadius: radius || '30px',
        marginLeft: marginLeft,
        marginRight: marginRight, pointerEvents: pointerEvents,
      }}
    >
      {children}
    </div>
  );
}
function PageDiv({children,path,className}){

  return <div id={"page-" + path.replace(/\W+/g, '-').toLowerCase()} className={className} style={{display:'none'}}>{children}</div>;
}
function Button({href,children,className,color}){
  if (color === undefined) { color = "#2196f3"; }
  return (
    <a href={href} className={className} style={{ textDecoration: 'none', color: 'inherit' }}>
      <button
        style={{
          padding: '10px 24px',
          borderRadius: '8px',
          border: '2px solid #1976d2',
          backgroundColor: color,
          color: 'white',
          fontWeight: '500',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'background 0.2s, box-shadow 0.2s',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          pointerEvents: 'all',
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = '#1976d2'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = '#2196f3'}
      >
        {children}
      </button>
    </a>
  );
}

function PageTemplate({children,path}){
  return (
    <PageDiv path={path} className= "app">
      <LayerContainer>
        <Thingy script={"1x,v,1;3x,h,2;2x,h,1"} z={1} className="clickthrough" classNameInherit="clickthrough">
          <ColoredRoundedSquare marginLeft="20px">
            <div class="Style1">
              
              <div class="Style2">
                 <div>
                  <a href="/axiom/" style={{ color: '#64b5f6', textDecoration: 'underline', fontSize: "0.8rem" }}>Return to homepage</a>
                  {children}
                 </div>
              </div>
            </div>
          </ColoredRoundedSquare>
        </Thingy>
        <ThingyEach script={"16x,h,1;9x,v,1"} z={0} dividerStyles={{border: '3px solid black'}}>
          <ColorOnHover></ColorOnHover>
        </ThingyEach>
      </LayerContainer>
    </PageDiv>
    );
  }
function Responses() {
  const [totalResponses, setTotalResponses] = React.useState(null);

  useEffect(() => {
    fetch("https://llmdump.duckdns.org:5000/")
      .then((response) => response.json())
      .then((data) => {
        if (data && data.totalResponses !== undefined) {
          setTotalResponses(data.totalResponses);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <span>
      {totalResponses !== null ? (
        <span>
          {totalResponses >= 20 ? `${totalResponses} out of 50` : `${totalResponses} out of 20`}
        </span>
      ) : (
        <span>(loading) out of (loading)</span>
      )}
    </span>
  );
    
}



//let logosrc = "logo.png"
function App() {
  useEffect(() => {
    var currentURL = window.location.href.substring(1);
    var redirect = sessionStorage.redirect;
    var hash = window.location.hash;
    delete sessionStorage.redirect;
    if (hash && hash !== "/"){
      currentURL = "https://itzmetanjim.github.io/axiom"+hash
      console.log("Changed current URL variable because hash was found",hash)
    }
    else if (redirect && redirect !== window.location.href) {
      currentURL=redirect
      console.log("Changed current URL variable because redirect was found")
    }
    
    console.log("Current URL:", currentURL);
    var page = currentURL.split("/").slice(3);
    var pathID = page.join("/").replace(/\W+/g, '-').toLowerCase();
    console.log("Page:", page);
    console.log("Path ID: /", pathID);
    window.currentPage = page;
    window.currentPathID = pathID;
    let pagediv = document.getElementById("page-" + pathID);
    if (pagediv) {
      pagediv.style.display = "block";
    } else {
      let four04div = document.getElementById("page-404");
      if (four04div) {
        four04div.style.display = "block";
      }
    }
    }, []);
  return (
    <>
    <PageDiv path="axiom-" className="App">
      <span className="PC">
      <LayerContainer>
        <Thingy script={"3x,v,2;3x,h,2;2x,h,1"} z={1} className="clickthrough" classNameInherit="clickthrough">
          <ColoredRoundedSquare pointerEvents={"none"}>
            <div class="FlexRowCenterWFull">
              <div class="FlexJCAC">
                <img src={logo} alt="Axiom Logo" width="400" class="MLAuto" />
              </div>
              <div style={{color: 'white', margin: '50px' }} class="FlexJCAC">
                 <div>
                  {/* c75d53ff-5b68-455e-ab8d-abc94dda6548 */}
                 <h1>Make a math/science related app,<br/> get rewards!</h1>
                 <p>Make any math or science related app and earn 5$/hour grant for anything math/science/programming
                  related or other special rewards.
                 </p>
                 <p><strong>RSVP so that this YSWS starts! <Responses/> RSVPs submitted!</strong></p>
                 <p style={{fontSize:"0.8rem"}}>Only for students aged 18 or under who are eligible for <a href="https://hackclub.com" style={{color:"lightblue"}}>Hack Club</a>.</p>
                 <p> <Button href="/axiom/rewards">Rewards</Button> <Button href="/axiom/submit">Submit</Button></p>
                 <p><Button href="https://forms.fillout.com/t/aXkqWZoos2us"><strong>RSVP!</strong></Button> <Button href="https://hackclub.slack.com/archives/C09K4HZJ2DP">Join Slack</Button></p>
                 <p><Button href="/axiom/guides">Guides and tools</Button> <Button href="/axiom/faq">FAQ</Button></p>
                 <p><Button href="https://bananahannah7.github.io/drone_notebook/">Example project (not by me) </Button></p>
                 </div>
              </div>
            </div>
          </ColoredRoundedSquare>
        </Thingy>
        <ThingyEach script={"16x,h,1;9x,v,1"} z={0} dividerStyles={{border: '3px solid black'}}>
          <ColorOnHover></ColorOnHover>
        </ThingyEach>
      </LayerContainer>
      </span>
      <span className="Mobile">
        <img src={logo} alt="Axiom Logo" width="400" class="MLAuto" />
        <br/>
        <div>
        {/* c75d53ff-5b68-455e-ab8d-abc94dda6548 */}
        <h1>Make a math/science related app,<br/> get rewards!</h1>
        <p>Make any math or science related app and earn 5$/hour grant for anything math/science/programming
        related or other special rewards.
        </p>
        <p><strong>RSVP so that this YSWS starts! <Responses/> RSVPs submitted!</strong></p>
        <p style={{fontSize:"0.8rem"}}>Only for students aged 18 or under who are eligible for <a href="https://hackclub.com" style={{color:"lightblue"}}>Hack Club</a>.</p>
        <p> <Button href="/axiom/rewards">Rewards</Button> <Button href="/axiom/submit">Submit</Button></p>
        <p><Button href="https://forms.fillout.com/t/aXkqWZoos2us"><strong>RSVP!</strong></Button> <Button href="https://hackclub.slack.com/archives/C09K4HZJ2DP">Join Slack</Button></p>
        <p><Button href="/axiom/guides">Guides and tools</Button> <Button href="/axiom/faq">FAQ</Button></p>
        <p><Button href="https://bananahannah7.github.io/drone_notebook/">Example project (not by me) </Button></p>
        </div>
      </span>
    </PageDiv>
    <PageTemplate path="axiom-submit">
      <h1>Submitting</h1>
      <p>Currently, the YSWS is not started yet. We need more RSVPs for it to start.</p>
      <p>If you are not in Hack Club yet, go to identity.hackclub.com and verify yourself first.</p>
      <p>You need to track your hours using Hackatime. <Button href="https://hackatime.hackclub.com/my/wakatime_setup">Set up Hackatime</Button></p>
      <p>Then, RSVP the YSWS to let us know you're interested.</p>
      <p><Button href="https://forms.fillout.com/t/aXkqWZoos2us">RSVP Here</Button></p>
      <p> or paste this link: https://forms.fillout.com/t/aXkqWZoos2us into your browser.</p>
      <p>After that, join the Slack channel #axiom: <Button href="https://hackclub.slack.com/archives/C09K4HZJ2DP">Join Slack</Button></p>
    </PageTemplate>
    <PageDiv path="axiom-404" className="App">
    <h1>404 - Page Not Found</h1>
    <p>Sorry, the page you are looking for does not exist.</p>
    <p><Button href="/axiom/">Go to Home</Button></p>
    </PageDiv> 
    <PageTemplate path="axiom-guides">
      <h2>Guides and Tools</h2>
      <p>Here are some guides and tools to help you get started with making math/science related apps.</p>
      
      <h3>MathQuill</h3>
      <p>This is a library for displaying LaTeX math in web applications.</p>

      <p><strong>Resources:</strong><Button href="/axiom/guides/mathquill">MathQuill template</Button> <Button href="https://docs.mathquill.com/en/latest/Getting_Started/">Official MathQuill docs (more advanced)</Button></p>
      <h3>SymPy</h3>
      <p>This is an easy purepython CAS library. You may want to consider something else if you need more speed, but this is the easiest.</p>
      <p>Example code</p>
      <pre className="language-python"><code>{`from sympy import symbols, expand, factor, simplify,solve
x, y = symbols('x y')
expr1 = (x + 1)**2
expr2 = x**2 - 1
expanded = expand(expr1)
print(f"Expanded: {expanded}") // Expanded: x**2 + 2*x + 1
factored = factor(expr2)
print(f"Factored: {factored}") // Factored: (x - 1)*(x + 1)
simplified = simplify((x**2 - 1)/(x - 1))
print(f"Simplified: {simplified}") // Simplified: x + 1
solution = solve(x**2 - 4,x)
print(f"Solutions: {solution}") // Solutions: [-2, 2]`}
      </code></pre>
      <p><strong>Resources:</strong> <Button href="https://docs.sympy.org/latest/index.html">Official SymPy docs</Button></p>
      </PageTemplate>
      <PageTemplate path="axiom-guides-mathquill">
        <a href="/axiom/guides" style={{ color: '#64b5f6', textDecoration: 'underline', fontSize: "0.8rem" }}>Return to guides</a>
        <h1>MathQuill guide</h1>
        <p>This is a simple template to get you started with MathQuill.</p>
        <p>This is assuming static HTML/CSS/JS.</p>
        <p>Include MathQuill CSS and JS in your HTML file. You can use the CDN links</p>
        <pre className="language-html"><code>{`
    <!-- in <head> -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.9.1/mathquill.js" integrity="sha512-ZSR/8q1yqynaTt93e8u/PNh6BsHRI/PWgriT6xObJIt+aFlOlOHFvQUJXB/SdHdI0HoEsi1asZejMPQOQhfRsg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/mathquill/0.9.1/mathquill.css" integrity="sha512-Gh9jugVbw863/UnmBitmARROcOkrLhMqPqbMEqwB5nfLf6g/bDEWgvPmwTav9e/s5LOwsnRhjtPSq/3yQ0RDsg==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
    <script>
        MQ = MathQuill.getInterface(2);
    </script>
        `}</code></pre>
        <p>Now, create static or editable math fields anywhere</p>
        <pre className="language-html"><code>{`
<!-- static math field -->
<p>Solve <span id="problem">ax^2 + bx + c = 0</span>.</p>
<script>
  var problemSpan = document.getElementById('problem');
  MQ.StaticMath(problemSpan);
</script>
<!-- editable math field -->
<p><span id="answer">x=</span></p>
<script>
  var answerSpan = document.getElementById('answer');
  function checkAnswer(enteredMath) {
    if (enteredMath === '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}') {
      alert('Correct!');
    }
  }
  var answerMathField = MQ.MathField(answerSpan, {
    handlers: {
      edit: function() {
        var enteredMath = answerMathField.latex(); // Get entered math in LaTeX format
        checkAnswer(enteredMath);
      }
    }
  });
</script>
        `}</code></pre>
        <p><strong>Important:</strong></p>
        <ul>
          <li>Make sure to include jQuery before MathQuill.</li>
          <li>Use the correct MathQuill version.</li>
        </ul>
        
      </PageTemplate>
      <PageTemplate path="axiom-rewards">
        <h1>Rewards</h1>
        <h2>Choose Your Reward</h2>
        <p>Code hours to earn rewards! Any remaining hours beyond your chosen reward go toward grants or additional items.</p>
        <p>If you want any other rewards, tell me in slack @itzmetanjim.</p>
        <h3>Raspberry Pi ± Kits</h3>
        <table style={{borderCollapse: 'collapse', width: '100%', marginBottom: '20px'}}>
          <thead>
            <tr style={{backgroundColor: '#111111'}}>
              <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Product</th>
              <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Hours Required</th>
              <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>Pi Zero 2W Kit (512MB RAM)</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>3+ hours</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>code 2 more hours you get 4x more ram and cpu</td>
            </tr>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>Raspberry Pi 4B Kit (2GB RAM)</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>5+ hours</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>Complete kit included</td>
            </tr>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>RPi 5 Kit (4GB RAM)</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>12+ hours</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>Latest generation</td>
            </tr>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>RPi 5 Kit (4GB RAM) + Pi Camera</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>17+ hours</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}></td>
            </tr>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>RPi 5 (8GB RAM, no kit)</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>16+ hours</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>No kit</td>
            </tr>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>RPi 5 (16GB RAM, no kit)</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>24+ hours</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>no kit, what are you even running here?</td>
            </tr>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>RPi 500 (Basic)</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>18+ hours</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>No mouse, HDMI cable, or power supply</td>
            </tr>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>RPi 500 Desktop Kit</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>21+ hours</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>Includes mouse, HDMI cable, 27W USB-C power supply, guidebook</td>
            </tr>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>RPi 500 PLUS</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>35+ hours</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>Uses RPI 5 16GB RAM, 256GB NVMe, RGB keyboard</td>
            </tr>
          </tbody>
        </table>

        <h3>Math Software</h3>
        <em>Note: I dont recommend  buying the 1 month mathematica unless you are just using your remaining hours.</em>
        <table style={{borderCollapse: 'collapse', width: '100%', marginBottom: '20px'}}>
          <thead>
            <tr style={{backgroundColor: '#111111'}}>
              <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Software</th>
              <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Duration</th>
              <th style={{border: '1px solid #ddd', padding: '12px', textAlign: 'left'}}>Hours Required</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>Maple Student Edition</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>1 year</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>12+ hours</td>
            </tr>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>MATLAB Student Edition</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>Forever</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>8+ hours</td>
            </tr>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>Mathematica Student Edition</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>1 month</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>1.5+ hours</td>
            </tr>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>Mathematica Student Edition</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>6 months</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>8+ hours</td>
            </tr>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>Mathematica Student Edition</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>1 year</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>14+ hours</td>
            </tr>
            <tr>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>Mathematica Student Edition</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>4 years</td>
              <td style={{border: '1px solid #ddd', padding: '12px'}}>35+ hours</td>
            </tr>
          </tbody>
        </table>

        <p><strong>Note:</strong> Any remaining hours beyond your chosen reward can be applied toward grants or additional items from the same or a different category.</p>
        
      </PageTemplate>
    <PageTemplate path="axiom-faq">
      <h1>FAQ</h1>
      <h3>Who can join?</h3>
      <p>A: Anyone who is 18 or under and eligible for Hack Club can join. If you're not in Hack Club yet, you can sign up at identity.hackclub.com.</p>
      <h3>What kind of apps can I make?</h3>
      <p>A: Any app related to math or science! It can be a calculator, a graphing tool, a physics simulator, or anything else you can think of.</p>
      <p>   However, programming itself does not count as math/science related.</p>
      <p>   If you are making a calculator, it has to be better than typing <code>python</code> in the terminal or using a Jupyter notebook.</p>
      <p>   <strong>The main purpose does not necessarily have to be math or science related</strong>, but if so it has to use (preferrably complicated) math inside the program.</p>
      <h3>Do I need to download anything?</h3>
      <p>A: Not really, but you do need to set up Hackatime. <Button href="https://hackatime.hackclub.com/my/wakatime_setup">Setup</Button></p>
      <p>You can use Codespaces if you want.</p>
      <h3>I have more questions!</h3>
      <p>Ask in the Slack channel #axiom</p>

    </PageTemplate>
    </>
  );
}

export default App;
