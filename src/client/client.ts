import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils'
import { GUI } from 'dat.gui'


const scene = new THREE.Scene()


// const gridHelper = new THREE.GridHelper(10, 10, 0xaec6cf, 0xaec6cf)
// scene.add(gridHelper)

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)

// Used to set the background color of the scene to be transparent.
// renderer.setClearColor( 0x000000, 0 );
scene.background = new THREE.Color("rgba(40, 49, 68, 1)");

document.body.appendChild(renderer.domElement)

// const geometry = new THREE.BoxGeometry()
// const material = new THREE.MeshBasicMaterial({
//     color: 0x00ff00,
//     wireframe: true,
// })

// const light = new THREE.AmbientLight(0xffffff, 10)
// light.position.set(0, -50, 12.66)
// scene.add(light)


// Replaced AmbientLight with PointLight. 
const light2 = new THREE.PointLight("#fff9d8", 25, 0, 0)
light2.position.set(-17.04, -10.44, 6.06)
scene.add(light2)

// Can remove this if you don't want to see the light helper.
const helper = new THREE.PointLightHelper(light2)
scene.add(helper)

let cube: THREE.Object3D;
const loader = new GLTFLoader();
loader.load('Sample_Final.glb', function (gltf) {
    const model = gltf.scene;
    if (model instanceof THREE.Group) {
        // model.scale.set(14, 8, 0.5);
        model.scale.set(1, 0.9, 0.9);

        cube = SkeletonUtils.clone(model);
        scene.add(cube)
        const newDir = new THREE.Vector3(0, 0, 1);
        const pos = new THREE.Vector3();
        pos.addVectors(newDir, cube.position);
        cube.lookAt(pos);
    }

    animate();

}, undefined, function (error) {
    console.error(error);
});


window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    render()
}

function lerp(x: number, y: number, a: number): number {
    return (1 - a) * x + a * y
}

// Used to fit the lerps to start and end at specific scrolling percentages
function scalePercent(start: number, end: number) {
    return (scrollPercent - start) / (end - start)
}

const animationScripts: { start: number; end: number; func: () => void }[] = []

//add an animation that moves the cube through first 25 percent of scroll
animationScripts.push({
    start: 0,
    end: 25,
    func: () => {
        if (cube) {
        camera.lookAt(cube.position)
        camera.position.set(0, 0, 10)
        cube.rotation.x = lerp(0, -Math.PI/2, scalePercent(0, 25))
        cube.scale.set(
            lerp(1, 0.4, scalePercent(0, 25)),
            lerp(0.9, 0.4, scalePercent(0, 25)),
            lerp(0.9, 0.4, scalePercent(0, 25))
        )

        light2.intensity = lerp(25, 4, scalePercent(0, 25))
        light2.position.set(
            lerp(-17.04, -0.54, scalePercent(0, 25)),
            lerp(-10.44, 1.66, scalePercent(0, 25)),
            lerp(6.06, 9.36, scalePercent(0, 25))
        )
        }
    },
})

//add an animation that rotates the cube between 40-60 percent of scroll
animationScripts.push({
    start: 40,
    end: 60,
    func: () => {
        if (cube) {
        camera.lookAt(cube.position)
        camera.position.set(0, 1, 2)
        cube.rotation.y = lerp(0, Math.PI, scalePercent(40, 60))
        //console.log(cube.rotation.z)
        }
    },
})

//add an animation that moves the camera between 60-80 percent of scroll
animationScripts.push({
    start: 60,
    end: 80,
    func: () => {
        if (cube) {
        camera.position.x = lerp(0, 5, scalePercent(60, 80))
        camera.position.y = lerp(1, 5, scalePercent(60, 80))
        camera.lookAt(cube.position)
        //console.log(camera.position.x + " " + camera.position.y)
        }
    },
})

// //add an animation that auto rotates the cube from 80 percent of scroll
// animationScripts.push({
//     start: 80,
//     end: 101,
//     func: () => {
//         camera.lookAt(cube.position)
//         camera.position.set(0, 1, 2)
//         cube.rotation.z = lerp(0, Math.PI, scalePercent(40, 60))
//     },
// })

function playScrollAnimations() {
    animationScripts.forEach((a) => {
        if (scrollPercent >= a.start && scrollPercent < a.end) {
            a.func()
        }
    })
}

let scrollPercent = 0

document.body.onscroll = () => {
    //calculate the current scroll progress as a percentage
    scrollPercent =
        ((document.documentElement.scrollTop || document.body.scrollTop) /
            ((document.documentElement.scrollHeight ||
                document.body.scrollHeight) -
                document.documentElement.clientHeight)) *
        100
    ;(document.getElementById('scrollProgress') as HTMLDivElement).innerText =
        'Scroll Progress : ' + scrollPercent.toFixed(2)
}


// Can remove this if you don't want to see the light helper.
const data = {
    color: light2.color.getHex(),
    mapsEnabled: true
}

const gui = new GUI()
const lightFolder = gui.addFolder('THREE.Light')
lightFolder.addColor(data, 'color').onChange(() => {
    light2.color.setHex(Number(data.color.toString().replace('#', '0x')))
})
lightFolder.add(light2, 'intensity', 0, 25, 0.01)

const pointLightFolder = gui.addFolder('THREE.PointLight')
pointLightFolder.add(light2, 'distance', 0, 100, 0.01)
pointLightFolder.add(light2, 'decay', 0, 4, 0.1)
pointLightFolder.add(light2.position, 'x', -50, 50, 0.01)
pointLightFolder.add(light2.position, 'y', -50, 50, 0.01)
pointLightFolder.add(light2.position, 'z', -50, 50, 0.01)
pointLightFolder.open()



// const stats = new Stats()
// document.body.appendChild(stats.dom)

function animate() {
    requestAnimationFrame(animate)

    playScrollAnimations()

    render()

    // stats.update()
}

function render() {
    renderer.render(scene, camera)
}

window.scrollTo({ top: 0, behavior: 'smooth' })

animate()


