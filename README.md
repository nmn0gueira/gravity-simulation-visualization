# Gravitational Force Simulation & Visualization


This program simulates the movement of small masses (particles) in the gravitational field of large, fixed bodies (planets). The planets are treated as stationary, and the forces they exert on the particles are used to calculate the particle's acceleration and update its position in each simulation step.

The simulation is interactive, allowing the user to control the placement of particles and planets.

### Running the Project Locally

To run this project locally, follow these steps:

1. **Clone the repository** to your local machine.
   
2. **Open the project folder** in Visual Studio Code.

3. **Install the Live Server extension** in Visual Studio Code if you haven't already.

4. **Start the Live Server**:
- Right-click on the `index.html` file in the file explorer and select **"Open with Live Server"**.
- Alternatively, click the **Go Live** button in the bottom-right corner of the VS Code window to start the server.


### Controls and Settings

| **Setting** | **Range** | **Default** | **Control** |
| --- | --- | --- | --- |
| Particle lifetime (min) | [1, 19] | 2 | 'q' - increase, 'a' - decrease |
| Particle lifetime (max) | [2, 20] | 10 | 'w' - increase, 's' - decrease |
| Particle injection position | (0,0) | (0,0) | Mouse with SHIFT key pressed |
| Particle minimum speed | 0.1 | 0.1 | SHIFT + Page Up - increase, SHIFT + Page Down - decrease |
| Particle maximum speed | 0.2 | 0.2 | Page Up - increase, Page Down - decrease |
| Injection velocity angle (horizontal) | [-∞, +∞] | 0 | Left Arrow - rotate left, Right Arrow - rotate right |
| Direction variation (particle source opening) | [0, π] | π | Up Arrow - increase, Down Arrow - decrease |

---

### How it works:
1. The position and velocity of each particle are updated based on the gravitational forces exerted by the planets.
2. The user can control the initial placement, speed, and angle of the particles using the controls above.
3. The simulation updates continuously, allowing for real-time interaction with the gravitational field.


### About
This project was made as part of the Computer Graphics and Interfaces (2022/23) course at FCT NOVA.
