import CustomersModel from "../models/customers.js";
import EmployeesModel from "../models/employee.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

const loginController = {};

// Configuración de bloqueo por intentos fallidos
const maxAttempts = 3;
const lockTime = 15 * 60 * 1000; // 15 minutos

loginController.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    let userFound;
    let userType;

    // 1️⃣ Admin
    if (
      email === config.emailAdmin.email &&
      password === config.emailAdmin.password
    ) {
      userType = "Admin";
      userFound = { _id: "Admin" };
    } else {
      // 2️⃣ Empleado
      userFound = await EmployeesModel.findOne({ email });
      userType = "Employee";

      // 3️⃣ Cliente
      if (!userFound) {
        userFound = await CustomersModel.findOne({ email });
        userType = "Customer";
      }
    }

    if (!userFound) {
      return res.status(404).json({ message: "User not found" });
    }

    // Bloqueo temporal si es empleado o cliente
    if (userType !== "Admin") {
      if (userFound.lockTime && userFound.lockTime > Date.now()) {
        const minutosRestantes = Math.ceil(
          (userFound.lockTime - Date.now()) / 60000
        );
        return res.status(403).json({
          message: `Cuenta bloqueada, intenta de nuevo en ${minutosRestantes} minutos`,
        });
      }
    }

    // Validar contraseña si no es Admin
    if (userType !== "Admin") {
      const isMatch = await bcryptjs.compare(password, userFound.password);
      if (!isMatch) {
        userFound.loginAttempts = (userFound.loginAttempts || 0) + 1;

        if (userFound.loginAttempts >= maxAttempts) {
          userFound.lockTime = Date.now() + lockTime;
          await userFound.save();
          return res
            .status(403)
            .json({ message: "Usuario bloqueado temporalmente" });
        }

        await userFound.save();
        return res.status(401).json({ message: "Invalid password" });
      }

      // Resetear intentos si contraseña correcta
      userFound.loginAttempts = 0;
      userFound.lockTime = null;
      await userFound.save();
    }

    // Generar token JWT
const token = jwt.sign(
  { id: userFound._id, userType: userType.toLowerCase() },
  config.JWT.secret,
  { expiresIn: config.JWT.expiresIn }
);


    // Guardar token en cookie
    res.cookie("authToken", token, {
      maxAge: 24 * 60 * 60 * 1000, // 1 día
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout: borrar la cookie
loginController.logout = (req, res) => {
  res.clearCookie("authToken", { path: "/" });
  res.json({ message: "Logout successful" });
};

export default loginController;
