
## Nécessaires à la compréhension de mon POK
- Des connaissances minimales en développement web : html / css et surtout JavaScript
- Des connaissances en React pour mieux comprendre la structure de mon projet et surtout connaître le fonctionnement des [hooks](https://fr.react.dev/learn#using-hooks)
- Savoir comment
Néanmoins, le début de mon POK commencera par une brève explication de comment faire un render très simple en Three.js en expliquant les appels aux API Web réalisés.

## Qu'est ce que Three.js

Extrait de wikipedia :
_**Three.js**_ est une bibliothèque [JavaScript](https://fr.wikipedia.org/wiki/JavaScript "JavaScript") pour créer des scènes [3D](https://fr.wikipedia.org/wiki/Trois_dimensions "Trois dimensions") dans un [navigateur web](https://fr.wikipedia.org/wiki/Navigateur_web "Navigateur web"). Elle peut être utilisée avec la balise [canvas](https://fr.wikipedia.org/wiki/Canvas_\(HTML\) "Canvas (HTML)") du [HTML5](https://fr.wikipedia.org/wiki/HTML5 "HTML5") sans avoir besoin d'un [plugin](https://fr.wikipedia.org/wiki/Plugin "Plugin"). Le [code source](https://fr.wikipedia.org/wiki/Code_source "Code source") est hébergé sur le [GitHub](https://fr.wikipedia.org/wiki/GitHub "GitHub") de son créateur mrDoob.

--- 

Pour vous introduire à ce concept, voici le code pour créer un cube qui tourne sur lui même, d'abord en Three.js classique puis en utilisant R3F.

```javascript
import * as THREE from "three";

  
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: "#00ff00" });
const cube = new THREE.Mesh(geometry, material);

cube.rotateX(0.5);
cube.rotateY(Math.PI / 4);
scene.add(cube);

camera.position.z = 4;
renderer.render(scene, camera);
  
function animate() {
	requestAnimationFrame(animate);
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
	renderer.render(scene, camera);
}

animate();
```
### Explication du code
- On crée une **scène** → "boîte" où l'on va mettre nos objets 3D
- On crée une **caméra** qui décide de comment on voit la scène
    - `75` → angle de vue (champ de vision)
    - `window.innerWidth / window.innerHeight` → ratio de l’écran (**API DOM : `window.innerWidth/innerHeight`**)
    - `0.1` → distance minimale de visibilité
    - `1000` → distance maximale de visibilité
- On crée un **renderer** (= moteur de rendu) pour dessiner la 3D dans la page
    - `.setSize(...)` → ajuste la taille du canvas
    - `.domElement` → c’est le `<canvas>` HTML où la 3D est dessinée
    - `document.body.appendChild(...)` → ajoute ce canvas dans la page (**API DOM : manipulation du HTML**)
- On crée un **cube** : une géométrie (forme), un matériau (apparence), puis un mesh (objet affichable)
- On oriente le cube (rotations X et Y)
- On ajoute le cube dans la **scène**
- On recule la **caméra** pour bien voir le cube
- On fait un **premier rendu** (image fixe)
- On crée une **animation** qui :
    - utilise `requestAnimationFrame(...)` (**API Web : animations fluides du navigateur**) pour relancer la fonction en boucle
    - fait tourner le cube petit à petit
    - redessine la scène à chaque frame

### Explication des librairies

Pour ce projet j'utilise Three.js, je vais donc brèvement expliquer Three.js à travers un code basique qui montre comment générer un cube et l'animer.

Etant donné que l'on veut coder un "jeu" qui aura différents états (en fonction du score, de si on vient de lancer la boule ou qu'on a gagné par exemple) et qu'on veut une interface web pour faire certaines choses j'ai décidé de travailler avec React car je suis habitué à utiliser le framework.
ReactThreeFiber (R3F dans la suite) est une librairie très utilisée (30k ⭐️ sur GitHub)  qui permet de faire du Three.js en utilisant des composants React , le but de mon POK est d'expérimenter avec cette librairie car j'ai déjà des connaissances avancées sur l'utilisation de Three.js que j'ai obtenue en grande partie grâce à la formation [Three.js journey de Bruno Simon](https://threejs-journey.com/) (payante mais que je conseille vivement).
Pour ce qui est de la physique nous utiliserons Rapier (qui est un moteur physique 2D et 3D écrit en Rust), via la librairie [react-three-rapier](https://github.com/pmndrs/react-three-rapier)qui est faite pour intégrer rapier très facilement dans du code ReactThreeFiber

Ainsi, l’exemple précédent (cube qui tourne) en R3F donnerait une version beaucoup plus concise :

```jsx
import { Canvas } from "@react-three/fiber"
import { useFrame } from "@react-three/fiber"
import { useRef } from "react"

function Cube() {
  const ref = useRef()
  useFrame(() => {
    ref.current.rotation.x += 0.01
    ref.current.rotation.y += 0.01
  })
  return (
    <mesh ref={ref} rotation={[0.5, Math.PI / 4, 0]}>
      <boxGeometry />
      <meshBasicMaterial color="#00ff00" />
    </mesh>
  )
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 75 }}>
      <Cube />
    </Canvas>
  )
}

```
### Explication du code R3F

- On utilise le composant **`Canvas`** (fourni par R3F) → il s’occupe de créer automatiquement la **scène**, la **caméra** et le **renderer**
    - Ici on définit la caméra avec `camera={{ position: [0, 0, 4], fov: 75 }}`
- On définit un composant React **`Cube`** → c’est notre objet 3D
    - `mesh` → c’est l’équivalent d’un **Mesh** Three.js (forme + matériau)
    - `rotation={[0.5, Math.PI / 4, 0]}` → orientation initiale du cube
    - `boxGeometry` → définit la forme (un cube)
    - `meshBasicMaterial color="#00ff00"` → définit le matériau (vert)
- On utilise le hook **`useRef`** pour avoir une **référence** vers le cube → permet de le modifier ensuite dans l’animation
- On utilise **`useFrame`** → c’est l’équivalent de `requestAnimationFrame` en R3F
    - Cette fonction est appelée à chaque image
    - On modifie la rotation du cube (`rotation.x` et `rotation.y`) pour le faire tourner
- Dans `App`, on affiche le **Canvas** (la scène 3D) et on place dedans notre **Cube**

# Recherche d'assets
début 9h10 21/09 - fin 9h40
### Listes d'assets 
- Quilles de bowling
- Boule de bowling
- Une texture de sol
- Une font (pour plus tard)
On cherche tout d'abord une texture pour le sol qui ressemble à  l'image
![[Pasted image 20250921091704.png]]

https://ambientcg.com/list?q=wood&sort=popular
https://polyhaven.com/textures/floor -> voir les laminate floor ou d'autres textures de sols dans la category wood

Quilles : https://poly.pizza/m/92eI1h_UJpU -> low poly de google (peut être changer plus tard)


## Mise en place du projet - idéation 1h
Je suis parti d'un repo personnel (et public) que j'utilise quand je veux faire des projets Three.js
J'utilise  [NodeJS](https://nodejs.org/fr) et le package [vite](https://vite.dev/) pour builder le projet rapidement, j'expliquerais les autres dépendances en temps et en heure quand elles seront utilisées mais c'est un projet peu modifié dans sa structure comparé au résultat que l'on aurait en faisant la commande `npm create vite@latest` 
Le code du répo est [ici](https://github.com/DamsSifma/r3f-vite-template)
#### Explications des dépendances (r3f)

> [!todo]
> Expliquer les différentes dépendances
> 

Une fois le repo cloné on peut simplement faire `npm install` pour installer les dépendances et le lancer en mode développement avec le script `npm run dev`, et voici le résultat

![[Capture d’écran 2025-09-23 à 14.12.27.png]]
On a 
- Un cube (plus précisément une mesh constituée d'une BoxGeometry de Three.js avec un MeshNormalMaterial)
- Une information sur les performances en haut à gauche, donnant différents indicateurs de performances que l'on abordera plus tard
- En haut à droite: un menu de debug utilisant [leva](https://github.com/pmndrs/leva) avec pour le moment un seul élément pour tester: celui de modifier la couleur du fond



## Sprint 1 - 10h pour avoir un premier résultat fonctionnel
**Dates Jeudi 2 Octobre - Samedi 4 Octobre entre 2 et 3h par jours** et quelques heures les week-end suivant jusqu'au 19 (début semaine entreprise)

Objectifs / Tâches :
- Avoir une piste de bowling
- Avoir des quilles importés d'un modèle 3D
- Avoir une boule de bowling 
- Interface pour pouvoir envoyer la boule de bowling
- Gérer la collision entre la boule et les quilles
- Gérer les collisions entre les quilles
- Gérer la collision avec la goutiere
- Réaliser un moyen de compter le nombre de quilles tombées (différent du nb de quilles touchées)


Fin en environ 12-14h  avec néanmoins une physique améliorable, la boule de bowling ne traverse que rarement la ligne entièrement et fini généralement dans la gouttière après avoir tapé les quilles probablement à cause de la restitution de la force des quilles (cependant même en diminuant la restitution j'ai le même problème) -> Je le met dans mon backlog en attendant

### Sprint 2 - 10h pour rajouter des fonctionalités
Dates: A partir du 31 octobre (après 2 semaine en entreprise)
Prévu : 
- Du son pour les collisions entre les objets (et même la boule qui roule)
- Une sorte de menu pour lancer la partie ? (Mode libre / mode partie)
- Régler un vrai jeu qui suit une partie de bowling (début -> fin)
- Animation pour spare / strike (/ autre ?)


31 Octobre : Son en utilisant useSound
J'ai créé un hook useSoundBoard que j'appelle lorsque il y a une collision, ce hook est responsable de gérer le chargement des différents sons ce qui permet de  j'ai décidé d'utiliser uneSound car c'est assez complexe de travailler avec les sons quand on fait du web

3 Novembre
Matin : J'ai fait une interface pour le menu, pour l'instant il permet de simplement lancer le jeu et j'ai également mis un bouton crédit qui m'amènera sur une popup avec les crédits (pour les assets que j'ai utilisé par exemple qui doivent être crédités), j'ai également mis le lien du dépot GitHub où est stocké le code source du projet 
Je me suis aidé de copilot pour le CSS du menu mais j'ai rectifié certaines parties (beaucoup trop de CSS à mon goût par rapport à l'importance du menu )

#### Game flow
Comment marche une partie de bowling ?
#### **Structure générale**

**1. Règle générale**
- Une partie se compose de **10 frames** (manches).
- Chaque frame compte **2 lancers maximum**, sauf le 10ème frame.

 **2. Déroulement d’un frame classique**
- **Si strike** (toutes les quilles renversées en 1 lancer) : le frame est terminé après ce lancer.
- **Si pas de strike** : le joueur relance une boule pour essayer de renverser les quilles restantes

**Le 10ème frame (dernier round) : règles spéciales**
- **Si strike ou spare** : Le joueur obtient **1 ou 2 lancers supplémentaires** pour compléter le calcul des points.
    - Ces lancers ne comptent que pour le 10ème frame. (càd pour compter les points bonus du spare ou strike sur le ou les 2 prochains lancers)

3 Novembre - 4 Novembre
J'ai travaillé sur la partie game flow, en réalisant une logique de calcul des points, gestions de la parties et des différentes frames, tout en prenant en compte le cas particulier de la dernière frame. J'ai remarqué un certains bugs avec des quilles qui étaient considérées tombées alors qu'elle ne l'étaient pas, et également dans l'autre sens. Je le rajoute au backlog.

#### Contrôles
- Position initiale de la boule selon x
- Puissance du lancer
- Angle du lancer
- (pas prio) Effets ?

Pour réaliser les contrôles j'ai décidé de couper le lancer en 3 étapes :
- Choisir la position initiale de la boule (horizontale)
![[Capture d’écran 2025-11-13 à 09.03.33.png]]
- Choisir l'angle de tir
- ![[Capture d’écran 2025-11-13 à 09.03.56.png]]
- Choisir la puissance
	- Ici j'ai décidé d'implémenter une sorte de jauge qui se rempli et qui se vide et où il faut appuyer au bon moment pour la puissance souhaitée (inspiré par Mario Golf 64 / le golf dans wii sports)

#### Derniers jours
Pour les derniers jours, maintenant que le jeu est fonctionnel j'aimerais pouvoir gérer
- Un meilleur calcul de si une quille est tombée ou non
- Animation spare / strike et son
- Meilleur "environnement" ?

## Déploiement
Pour un déploiement basique et gratuit j'ai décidé de passer par [vercel](https://vercel.com/) qui permet de déployer des applications Node très rapidement.
Je me suis connecté avec mon compte GitHub et j'ai simplement réalisé ces étapes
- Je suis allé dans mon dashboard
- En haut à droite j'ai fait Add new -> project
- J'ai choisi mon projet (qui est reconnu comme un projet Vite)
- J'ai déployé
- A chaque nouveau commit Vercel redeploit automatiquement


