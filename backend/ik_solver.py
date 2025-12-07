import math
import logging

# Logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("IK_Solver")

class IKSolver:
    def __init__(self, link_lengths=[105, 105, 100]):
        """
        Simple 3DOF + Wrist IK Solver for 6DOF Arm.
        link_lengths: [L1 (Shoulder), L2 (Elbow), L3 (Wrist)] in mm
        """
        self.L1 = link_lengths[0] # Shoulder to Elbow
        self.L2 = link_lengths[1] # Elbow to Wrist
        self.L3 = link_lengths[2] # Wrist to Gripper Tip

    def solve(self, x_mm, y_mm, z_mm):
        """
        Calculates angles for Base, Shoulder, Elbow, Wrist
        Target: (x, y, z) in mm relative to Base Servo.
        Returns: [Base, Shoulder, Elbow, Wrist_Pitch, Wrist_Roll, Grip]
        """
        try:
            # 1. Base Angle (Theta 1)
            # Simple Atan2 to point towards the object on ground plane
            theta1 = math.degrees(math.atan2(y_mm, x_mm))
            
            # 2. Distance projection on ground
            r_ground = math.sqrt(x_mm**2 + y_mm**2)
            
            # 3. Wrist Position
            # We want the gripper to point spectrum DOWN (-90 deg from horizontal)
            # So the wrist joint is actually at (r_ground, z_mm + L3) roughly
            # Simplified: Let's solve IK for the WRIST JOINT, not the tip.
            
            # Target for Wrist Joint
            target_r = r_ground
            target_z = z_mm + self.L3 
            
            # Distance from Shoulder to Target Wrist
            d = math.sqrt(target_r**2 + target_z**2)
            
            if d > (self.L1 + self.L2):
                logger.warning("Target out of reach!")
                return None
                
            # Law of Cosines for Shoulder (Theta 2) and Elbow (Theta 3)
            # a = L1, b = L2, c = d
            
            # Angle at shoulder between L1 and d
            alpha = math.acos((self.L1**2 + d**2 - self.L2**2) / (2 * self.L1 * d))
            # Angle of d relative to ground
            beta = math.atan2(target_z, target_r)
            
            theta2 = math.degrees(beta + alpha)
            
            # Angle at Elbow
            gamma = math.acos((self.L1**2 + self.L2**2 - d**2) / (2 * self.L1 * self.L2))
            theta3 = 180 - math.degrees(gamma) # Elbow usually defined relative to L1 link
            
            # 4. Wrist Pitch (Theta 4)
            # To keep gripper vertical (pointing down -90 relative to world):
            # Sum of angles = Theta2 + Theta3 + Theta4 = 0 (horizontal) ???
            # Actually: Pitch = -90 - (Theta2 + Theta3 - 180) approximately
            # Tuning this usually requires empirical test.
            # For now, let's set it to flatten out.
            theta4 = 180 - (theta2 + theta3) 
            
            # 5. Wrist Roll & Grip
            theta5 = 90 # Neutral
            theta6 = 0  # Open/Close state controlled separately
            
            # Normalize angles 0-180 for standard servos
            angles = [
                int(90 + theta1),   # Base centered at 90
                int(theta2),        # Shoulder
                int(theta3),        # Elbow
                int(theta4 + 90),   # Wrist Pitch
                int(theta5),        # Wrist Roll
                int(theta6)         # Grip
            ]
            
            # Clamp
            angles = [max(0, min(180, a)) for a in angles]
            
            return angles

        except Exception as e:
            logger.error(f"IK Calculation Failed: {e}")
            return [90, 90, 90, 90, 90, 0] # Return Safe Home

# Helper to Map Camera Pixels to mm
def pixel_to_mm(px_x, px_y, img_width=640, img_height=480):
    # Field of View Config (Measures needed from user)
    # Assume 640px = 64cm (640mm) width -> 1px = 1mm
    SCALE_X = 1.0 
    SCALE_Y = 1.0
    
    # Origin (0,0) of robot relative to camera center
    # Assume Robot Base is at bottom-center of image
    CAM_CENTER_X = img_width / 2
    CAM_BASE_Y = img_height 
    
    # Transform
    world_x = (px_x - CAM_CENTER_X) * SCALE_X
    world_y = (CAM_BASE_Y - px_y) * SCALE_Y
    world_z = 0 # Table height
    
    return world_x, world_y, world_z
