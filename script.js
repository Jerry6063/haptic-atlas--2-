document.addEventListener('DOMContentLoaded', () => {
    initThreeJS();
    initAnimations();
    initPrototypeDemo();
    initNetworkGraph(); // Knowledge Graph with D3 physics + P5 rendering
});

// ===============================================
// 1. THREE.JS: Topographic Wireframe Landscape
// ===============================================
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    if (!container) return;

    // SCENE SETUP
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.02); // Deep fog matches bg

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 15, 40);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // TERRAIN GENERATION
    const planeGeometry = new THREE.PlaneGeometry(120, 120, 40, 40); 
    const planeMaterial = new THREE.PointsMaterial({
        color: 0x444444,
        size: 0.3,
    });
    
    // Wireframe for "grid" look
    const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x00f3ff, transparent: true, opacity: 0.15 });
    
    // Create Points (Vertices)
    const points = new THREE.Points(planeGeometry, planeMaterial);
    
    // Create Lines (Wireframe)
    const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(planeGeometry), wireframeMaterial);
    
    const terrainGroup = new THREE.Group();
    terrainGroup.add(points);
    terrainGroup.add(wireframe);
    terrainGroup.rotation.x = -Math.PI / 2.5; 
    scene.add(terrainGroup);

    // ANIMATION VARS
    let time = 0;
    const originalPositions = planeGeometry.attributes.position.array.slice();

    function animate() {
        requestAnimationFrame(animate);
        time += 0.003;

        terrainGroup.rotation.z = time * 0.1;

        const positionAttribute = planeGeometry.attributes.position;
        for (let i = 0; i < positionAttribute.count; i++) {
            const x = originalPositions[i * 3];
            const y = originalPositions[i * 3 + 1];
            // Simple wave math
            const z = Math.sin(x * 0.1 + time) * 2 + Math.cos(y * 0.1 + time) * 2;
            positionAttribute.setZ(i, z);
        }
        
        positionAttribute.needsUpdate = true;
        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// ===============================================
// 2. GSAP SCROLL ANIMATIONS
// ===============================================
function initAnimations() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        const sections = document.querySelectorAll('.lab-section');
        
        sections.forEach(section => {
            gsap.fromTo(section,
                { opacity: 0, y: 50 },
                {
                    opacity: 1, 
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 85%',
                    }
                }
            );
        });

        gsap.to('.hero-title-block', {
            y: -50,
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });
    }
}

// ===============================================
// 3. PROTOTYPE DEMO LOGIC
// ===============================================
function initPrototypeDemo() {
    const buttons = document.querySelectorAll('.ctrl-btn');
    const actuator = document.querySelector('.haptic-actuator');
    const readout = document.getElementById('haptic-text');

    if (!buttons.length) return;

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pattern = btn.getAttribute('data-pattern');
            const desc = btn.getAttribute('data-desc');
            readout.textContent = `EXECUTING: ${desc}`;
            actuator.className = 'haptic-actuator'; // reset
            void actuator.offsetWidth; // force reflow
            switch(pattern) {
                case 'turn-left': actuator.classList.add('vibrate-left'); break;
                case 'turn-right': actuator.classList.add('vibrate-right'); break;
                case 'stairs': actuator.classList.add('vibrate-pulse'); break;
                case 'stop': actuator.classList.add('vibrate-buzz'); break;
            }
        });
    });
}

// ===============================================
// 4. KNOWLEDGE GRAPH (Connected Papers Style)
// ===============================================
function initNetworkGraph() {
    
    // --- DATA ---
    // Edit this array to add/remove papers
    const references = [
        {
          id: "ross-2002-wearable-interfaces",
          year: 2002,
          title: "Wearable Interfaces for Orientation and Wayfinding",
          authors: "Ross & Blasch",
          type: "haptic-nav",
          url: "https://www.cs.unc.edu/~welch/class/mobility/papers/p193-ross.pdf",
          summary: "Three wearable orientation interfaces evaluated with people with severe visual impairment.",
          tags: ["haptics", "navigation", "blindness", "wearable"]
        },
        {
          id: "manduchi-2015-vibrotactile-guidance",
          year: 2015,
          title: "Vibrotactile Guidance for Wayfinding of Blind Walkers",
          authors: "Manduchi et al.",
          type: "haptic-nav",
          url: "https://escholarship.org/content/qt93d0b2f3",
          summary: "A belt-style vibrotactile interface that provides simple directional cues to guide blind walkers.",
          tags: ["haptics", "navigation", "belt", "blindness"]
        },
        {
          id: "spiers-2016-shape-changing-interface",
          year: 2016,
          title: "Outdoor Pedestrian Navigation with Shape-Changing Interface",
          authors: "Spiers & Dollar",
          type: "haptic-nav",
          url: "https://www.eng.yale.edu/grablab/pubs/Spiers_HAPTICS2016.pdf",
          summary: "A handheld, shape-changing haptic device that assists outdoor pedestrian navigation.",
          tags: ["haptics", "navigation", "shape-changing", "wearable"]
        },
        {
          id: "kilian-2022-unfolding-space-glove",
          year: 2022,
          title: "The Unfolding Space Glove",
          authors: "Kilian et al.",
          type: "haptic-nav",
          url: "https://www.mdpi.com/1424-8220/22/5/1859",
          summary: "An open-source glove that converts depth information of nearby objects into vibration patterns.",
          tags: ["haptics", "sensory-substitution", "navigation", "wearable"]
        },
        {
          id: "skulimowski-2025-haptic-auditory-cues",
          year: 2025,
          title: "Haptic and Auditory Cues for Independent Navigation",
          authors: "Skulimowski et al.",
          type: "haptic-nav",
          url: "https://link.springer.com/article/10.1007/s12193-025-00463-2",
          summary: "A custom tactile belt with 20 vibrating actuators and audio cues.",
          tags: ["haptics", "navigation", "belt", "audio", "blindness"]
        },
        {
          id: "miranda-2020-urban-mosaic",
          year: 2020,
          title: "Urban Mosaic: Visual Exploration of Streetscapes",
          authors: "Miranda et al.",
          type: "urban-access",
          url: "https://fmiranda.me/publications/urban-mosaic/chi-2020-urban-mosaic.pdf",
          summary: "Uses large-scale street-level imagery to explore streetscapes and accessibility.",
          tags: ["urban", "accessibility", "streetscape", "tactile-paving"]
        },
        {
          id: "mitropoulos-2023-accessibility-index",
          year: 2023,
          title: "A Composite Index for Assessing Accessibility",
          authors: "Mitropoulos et al.",
          type: "urban-access",
          url: "https://www.sciencedirect.com/science/article/pii/S0966692323000388",
          summary: "Introduces the Infrastructure Accessibility Index combining sidewalks and crossings.",
          tags: ["urban", "accessibility", "index", "infrastructure"]
        },
        {
          id: "papanicolaou-2025-reframing-accessibility",
          year: 2025,
          title: "Reframing Urban Accessibility Through Universal Design",
          authors: "Papanicolaou et al.",
          type: "urban-access",
          url: "https://www.mdpi.com/2073-445X/14/10/2017",
          summary: "Uses universal design principles and tactile paving interventions to improve safety.",
          tags: ["urban", "accessibility", "universal-design", "tactile-paving"]
        },
        {
          id: "hornecker-2005-embodied-facilitation",
          year: 2005,
          title: "A Design Theme for Tangible Interaction",
          authors: "Hornecker & Buur",
          type: "embodied-theory",
          url: "https://dl.eusset.eu/bitstreams/e34460f4-b45a-4c7c-bf8e-bbd49c267269/download",
          summary: "A seminal framework for tangible interaction focusing on bodily engagement.",
          tags: ["embodied-interaction", "tangible", "theory"]
        },
        {
          id: "hobye-2011-touching-a-stranger",
          year: 2011,
          title: "Touching a Stranger: Designing for Engaging Experience",
          authors: "Hobye & Löwgren",
          type: "embodied-theory",
          url: "https://www.ijdesign.org/index.php/IJDesign/article/view/976/364",
          summary: "The Mediated Body suit explores intimate touch-based interaction and social play.",
          tags: ["embodied-interaction", "public-space", "wearable", "experience"]
        },
        {
          id: "lee-2020-embodied-interaction-spatial-skills",
          year: 2020,
          title: "Embodied Interaction and Spatial Skills",
          authors: "Lee-Cultura",
          type: "embodied-theory",
          url: "https://academic.oup.com/iwc/article/32/4/331/5976293",
          summary: "A systematic review connecting embodied interaction techniques with spatial skills.",
          tags: ["embodied-interaction", "spatial-skills", "review"]
        },
        {
          id: "parker-2021-wayfinding-tools",
          year: 2021,
          title: "Wayfinding Tools for People With Visual Impairments",
          authors: "Parker et al.",
          type: "embodied-theory",
          url: "https://www.frontiersin.org/articles/10.3389/feduc.2021.723816/full",
          summary: "Reviews orientation and mobility (O&M) tools and teaching strategies.",
          tags: ["wayfinding", "education", "blindness", "mobility"]
        }
    ];

    // --- SETUP LINKAGES ---
    const links = [];
    const nodes = references.map((d, i) => ({ ...d, index: i }));

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            const tagsA = nodes[i].tags;
            const tagsB = nodes[j].tags;
            const intersection = tagsA.filter(t => tagsB.includes(t));
            
            if (intersection.length > 0) {
                links.push({
                    source: nodes[i].id,
                    target: nodes[j].id,
                    value: intersection.length 
                });
            }
        }
    }

    // --- GENERATE LIST (Left Column) ---
    const listContainer = document.getElementById('ref-list-container');
    listContainer.innerHTML = '';
    
    // Sort papers by year for list
    const sortedRefs = [...references].sort((a,b) => b.year - a.year);

    sortedRefs.forEach(ref => {
        const item = document.createElement('div');
        item.className = 'ref-item';
        item.setAttribute('id', `ref-item-${ref.id}`);
        item.setAttribute('data-id', ref.id);
        item.setAttribute('data-type', ref.type);
        
        item.innerHTML = `
            <div class="ref-meta">
                <span class="ref-year">${ref.year}</span>
                <span class="ref-type">${ref.type.replace('-', ' ').toUpperCase()}</span>
            </div>
            <h5 class="ref-title">${ref.title}</h5>
            <p class="ref-desc">${ref.summary}</p>
        `;
        
        // Interaction Listeners (Dispatch events to window for p5 to catch)
        item.addEventListener('mouseenter', () => window.dispatchEvent(new CustomEvent('node-hover', { detail: ref.id })));
        item.addEventListener('mouseleave', () => window.dispatchEvent(new CustomEvent('node-clear')));
        item.addEventListener('click', () => {
             window.dispatchEvent(new CustomEvent('node-select', { detail: ref.id }));
             window.open(ref.url, '_blank');
        });

        listContainer.appendChild(item);
    });

    // --- P5.JS + D3 PHYSICS ENGINE (Right Column) ---
    const sketch = (p) => {
        let simulation;
        let mouseHoverNodeId = null; // Hover triggered by mouse position on canvas
        let listHoverNodeId = null;  // Hover triggered by hovering the left list
        let selectedId = null;
        let draggingNode = null;
        
        // INTERACTION STATE FOR PAN/ZOOM/CLICK
        let view = { x: 0, y: 0, zoom: 1 };
        let isPanning = false;
        let panStart = { x: 0, y: 0 };
        let viewStart = { x: 0, y: 0 };
        
        // CLICK VS DRAG THRESHOLD
        let dragStartTime = 0;
        let dragStartPos = { x: 0, y: 0 };
        const DRAG_THRESHOLD = 5; // Pixels movement to consider a drag

        // COLOR PALETTE (Grayscale refinement)
        const colors = {
            'haptic-nav': p.color('#ffffff'),      // White
            'urban-access': p.color('#bbbbbb'),    // Silver
            'embodied-theory': p.color('#666666'), // Dark Grey
            'default': p.color('#888888')
        };

        p.setup = () => {
            const container = document.getElementById('network-canvas');
            const w = container.offsetWidth || 500;
            const h = container.offsetHeight || 400;
            p.createCanvas(w, h).parent('network-canvas');
            
            // D3 Simulation
            simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id(d => d.id).distance(d => 120 / Math.sqrt(d.value)))
                .force("charge", d3.forceManyBody().strength(-200))
                .force("center", d3.forceCenter(w / 2, h / 2))
                .force("collide", d3.forceCollide().radius(25).strength(0.7));

            for (let i = 0; i < 50; i++) simulation.tick();
        };

        p.draw = () => {
            p.clear();
            
            // APPLY CAMERA TRANSFORM
            p.push();
            p.translate(view.x, view.y);
            p.scale(view.zoom);
            
            // CALCULATE MOUSE IN WORLD COORDS
            const worldMouseX = (p.mouseX - view.x) / view.zoom;
            const worldMouseY = (p.mouseY - view.y) / view.zoom;

            // MOUSE HOVER DETECTION (Only runs if not panning/dragging)
            // We use a separate variable 'mouseHoverNodeId' so we don't overwrite the 'listHoverNodeId'
            if(!isPanning && !draggingNode) {
                let newMouseHover = null;
                // Only check collision if mouse is inside canvas bounds to save perf and avoid conflicts
                if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
                    for(let n of nodes) {
                        if(p.dist(worldMouseX, worldMouseY, n.x, n.y) < (n.id === selectedId ? 25 : 15)) {
                            newMouseHover = n.id;
                            break;
                        }
                    }
                }
                
                if(newMouseHover !== mouseHoverNodeId) {
                    mouseHoverNodeId = newMouseHover;
                    // We only sync to DOM if the MOUSE caused the hover
                    if (mouseHoverNodeId) updateDOMState(mouseHoverNodeId, selectedId);
                    else if (!listHoverNodeId) updateDOMState(null, selectedId); // Clear only if list isn't active
                }
            }

            // EFFECTIVE HOVER: Combined Mouse OR List
            const effectiveHoverId = draggingNode ? draggingNode.id : (mouseHoverNodeId || listHoverNodeId);

            // DRAW LINKS
            p.strokeWeight(1 / view.zoom); // Keep lines thin regardless of zoom
            links.forEach(link => {
                const isConnected = (effectiveHoverId && (link.source.id === effectiveHoverId || link.target.id === effectiveHoverId));
                if (effectiveHoverId && !isConnected) {
                    p.stroke(255, 30);
                } else if (isConnected) {
                    p.stroke(255, 180);
                } else {
                    p.stroke(255, 60);
                }
                p.line(link.source.x, link.source.y, link.target.x, link.target.y);
            });

            // DRAW NODES
            p.noStroke();
            nodes.forEach(node => {
                const isHover = (node.id === effectiveHoverId);
                const isSelected = (node.id === selectedId);
                const isDimmed = (effectiveHoverId && !isHover && !isNeighbor(node.id, effectiveHoverId));

                let c = colors[node.type] || colors['default'];
                
                // Idle Animation
                const breath = (selectedId === null && effectiveHoverId === null) 
                    ? Math.sin(p.frameCount * 0.03 + node.index) * 2 
                    : 0;

                let r = p.map(node.year, 2002, 2025, 8, 12);
                if(isHover || isSelected) r = 15;
                
                if (isDimmed) {
                    p.fill(p.red(c), p.green(c), p.blue(c), 40);
                } else {
                    p.fill(c);
                }
                
                p.circle(node.x, node.y, (r + breath) * 2);

                // Label
                if (isHover || isSelected) {
                    p.fill(255);
                    p.textAlign(p.CENTER);
                    p.textSize(12 / view.zoom);
                    p.text(node.authors.split(' ')[0] + " '" + node.year.toString().slice(2), node.x, node.y + r + (15/view.zoom));
                }
            });
            
            p.pop(); // RESTORE MATRIX

            // PHYSICS UPDATE FOR DRAGGING
            if (draggingNode) {
                draggingNode.fx = worldMouseX;
                draggingNode.fy = worldMouseY;
                simulation.alphaTarget(0.3).restart();
            }
            
            // CURSOR & TOOLTIP
            // Only show tooltip if hover came from MOUSE, not from List
            if(mouseHoverNodeId && !isPanning) {
                document.body.style.cursor = 'pointer';
                const n = nodes.find(x => x.id === mouseHoverNodeId);
                if(n) {
                    const screenX = n.x * view.zoom + view.x;
                    const screenY = n.y * view.zoom + view.y;
                    showTooltip(n, screenX, screenY);
                }
            } else if (isPanning) {
                document.body.style.cursor = 'grabbing';
                hideTooltip();
            } else {
                document.body.style.cursor = 'default';
                hideTooltip();
            }
        };

        // --- MOUSE EVENTS ---
        
        p.mousePressed = () => {
            // BOUNDARY CHECK: Do not capture click if outside canvas (avoids interfering with list)
            if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
                return;
            }

            const worldMouseX = (p.mouseX - view.x) / view.zoom;
            const worldMouseY = (p.mouseY - view.y) / view.zoom;
            
            // Hit test
            let hitNode = null;
            for(let n of nodes) {
                if(p.dist(worldMouseX, worldMouseY, n.x, n.y) < 20) {
                    hitNode = n;
                    break;
                }
            }

            if(hitNode) {
                draggingNode = hitNode;
                selectedId = hitNode.id;
                mouseHoverNodeId = hitNode.id; // Assume mouse is now hovering this
                
                dragStartPos = { x: p.mouseX, y: p.mouseY }; 
                dragStartTime = p.millis();
            } else {
                isPanning = true;
                panStart = { x: p.mouseX, y: p.mouseY };
                viewStart = { x: view.x, y: view.y };
            }
        };

        p.mouseDragged = () => {
            if(isPanning) {
                const dx = p.mouseX - panStart.x;
                const dy = p.mouseY - panStart.y;
                view.x = viewStart.x + dx;
                view.y = viewStart.y + dy;
            }
        };

        p.mouseReleased = () => {
            if (draggingNode) {
                const distMoved = p.dist(p.mouseX, p.mouseY, dragStartPos.x, dragStartPos.y);
                if (distMoved < DRAG_THRESHOLD) {
                    // Click confirmed
                    updateDOMState(draggingNode.id, draggingNode.id);
                    scrollToListItem(draggingNode.id);
                    window.open(draggingNode.url, '_blank');
                }
                
                draggingNode.fx = null;
                draggingNode.fy = null;
                draggingNode = null;
                simulation.alphaTarget(0);
            }
            isPanning = false;
        };

        // SCOPED MOUSE WHEEL
        p.mouseWheel = (event) => {
            // FIX: If mouse is outside canvas (over the list), let default scroll happen
            if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) {
                return true; 
            }

            const zoomSensitivity = 0.001;
            const newZoom = p.constrain(view.zoom - event.delta * zoomSensitivity, 0.5, 3.0);
            
            const wx = (p.mouseX - view.x) / view.zoom;
            const wy = (p.mouseY - view.y) / view.zoom;
            
            view.x -= wx * (newZoom - view.zoom);
            view.y -= wy * (newZoom - view.zoom);
            view.zoom = newZoom;
            
            return false; // Block default scroll ONLY if over canvas
        };

        p.windowResized = () => {
            const container = document.getElementById('network-canvas');
            if(container) {
                p.resizeCanvas(container.offsetWidth, container.offsetHeight);
                simulation.force("center", d3.forceCenter(p.width / 2, p.height / 2));
                simulation.alpha(1).restart();
            }
        };

        // --- GLOBAL LISTENERS (List -> Graph) ---
        window.addEventListener('node-hover', (e) => {
             // Only update if not dragging to prevent conflicts
             if(!draggingNode) {
                 listHoverNodeId = e.detail;
                 // Note: we don't need to force redraw, p5 draw loop handles it next frame
             }
        });
        window.addEventListener('node-clear', () => {
             if(!draggingNode) {
                 listHoverNodeId = null;
             }
        });
        window.addEventListener('node-select', (e) => {
             selectedId = e.detail;
             simulation.alpha(0.3).restart();
        });

        function isNeighbor(aId, bId) {
            return links.some(l => 
                (l.source.id === aId && l.target.id === bId) ||
                (l.source.id === bId && l.target.id === aId)
            );
        }
    };

    // --- DOM HELPERS ---

    function updateDOMState(hoverId, selectId) {
        document.querySelectorAll('.ref-item').forEach(el => {
            const id = el.getAttribute('data-id');
            if (id === hoverId || id === selectId) {
                el.classList.add('active');
            } else {
                el.classList.remove('active');
            }
        });
    }

    function showTooltip(node, screenX, screenY) {
        let tt = document.getElementById('graph-tooltip');
        if(!tt) {
            tt = document.createElement('div');
            tt.id = 'graph-tooltip';
            tt.className = 'graph-tooltip';
            document.getElementById('network-canvas').appendChild(tt);
        }
        
        tt.style.left = `${screenX}px`;
        tt.style.top = `${screenY}px`; 
        
        tt.innerHTML = `
            <span class="tooltip-title">${node.title}</span>
            <span class="tooltip-meta">${node.year} // ${node.authors}</span>
            <span class="tooltip-desc">${node.summary}</span>
        `;
        tt.classList.add('visible');
    }

    function hideTooltip() {
        const tt = document.getElementById('graph-tooltip');
        if(tt) tt.classList.remove('visible');
    }

    function scrollToListItem(id) {
        const el = document.getElementById(`ref-item-${id}`);
        if(el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    new p5(sketch);
}