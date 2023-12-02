const fs = require("fs/promises");

const path = require("path");

const { v4: uuidv4 } = require("uuid");

const gravatar = require("gravatar");

const bcrypt = require("bcrypt");

const crypto = require("crypto");

const jwt = require("jsonwebtoken");

const sendMessage = require("./helpers/email_send.js");

const loader = require("./models/contacts.js");

const validator = require("./validator.js");

const User = require("./schemas/user.js");

const Contact = require("./schemas/contact.js");

const contactsList = async (req, res, next) => {
  try {
    const result = await loader.listContacts();
    if (result) {
      res.status(200).json(result);
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};
const someContacts = async (req, res, next) => {
  try {
    const result = await loader.someContacts(req.params.limit);
    if (result) {
      res.status(200).json(result);
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const filteredContacts = async (req, res, next) => {
  try {
    const result = await loader.listContacts();
    if (result) {
      const contactsFiltered = result.filter(
        (contact) => contact.favorite === req.params.favorite
      );
      res.status(200).json(contactsFiltered);
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const getContact = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { error } = await validator.schemaId.validateAsync({
      id: id,
    });
    if (error) {
      res.status(400).json({ message: "Identifier is mot valid" });
    }
  } catch (error) {
    console.error(e);
    next(e);
  }
  try {
    const result = await loader.getContactById(id);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};
const isFavorite = async (req, res, next) => {
  const { id } = req.params;
  try {
    const { error } = await validator.schemaId.validateAsync({
      id: id,
    });
    if (error) {
      res.status(400).json({ message: "Identifier is mot valid" });
    }
  } catch (error) {
    console.error(e);
    next(e);
  }
  try {
    const result = await loader.isFavorite(id);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (e) {
    console.error(e);
    next(e);
  }
};

const addContact = async (req, res, next) => {
  const { name, email, phone, favorite } = req.body;

  req.body.id = uuidv4();

  try {
    const { error } = await validator.contactSchema.validateAsync(req.body);
    if (error) {
      res.status(400).json({ message: "missing required name field" });
    }
  } catch (error) {
    console.error(e);
    next(e);
  }
  try {
    const result = await loader.addContact(req.body);
    if (result) {
      res.status(201).json(result);
    }
  } catch (error) {
    console.error(e);
    next(e);
  }
};

const removeContact = async (req, res, next) => {
  try {
    const { error } = await validator.schemaId.validateAsync({
      id: req.params.contactId,
    });
    if (error) {
      res.status(400).json({ message: "Identifier is mot valid" });
    }
  } catch (error) {
    console.error(e);
    next(e);
  }
  try {
    const result = await loader.removeContact(req.params.contactId);
    if (result) {
      res.status(200).json({ message: "contact deleted" });
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    console.error(e);
    next(e);
  }
};

const updateContacts = async (req, res, next) => {
  if (!Object.keys(req.body).length) {
    res.status(400).json({ message: "missing field favorite" });
  } else {
    try {
      const result = await loader.updateStatusContact(
        req.params.contactId,
        req.body
      );
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json({ message: "Not found" });
      }
    } catch (error) {
      console.error(e);
      next(e);
    }
  }
};
const updateSubscription = async (req, res, next) => {
  const { subscription } = req.body;

  try {
    const user = await User.findOne({ subscription });
    const result = await User.findByIdAndUpdate(user.subscription, [
      "starter",
      "pro",
      "business",
    ]);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ message: "Not found" });
    }
  } catch (error) {
    console.error(e);
    next(e);
  }
};
const register = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const { error } = await validator.schemaRegister.validateAsync(req.body);
    if (error) {
      res.send({
        Status: (400)["Bad Request"],
        "Content-Type": "application/json",
        ResponseBody: "missing required name field",
      });
    }
  } catch (error) {
    console.error(e);
    next(e);
  }
  const user = await User.findOne({ email });
  if (user) {
    return res.send({
      Status: (409)["Conflict"],
      "Content-Type": "application/json",
      ResponseBody: {
        message: "Email in use",
      },
    });
  }

  const verificationToken = crypto.randomUUID();
  try {
    await sendMessage({
      to: email,
      subject: "Welcom to the Contacts List",
      html: 'To confirm your registration please click on the <a href="">Link</a>',
      text: `To confirm your registration please open the Link http://localhost:8080//users/verify/:${verificationToken}`,
    });

    await User.create({
      email,
      password: passwordHashed,
      avatarURL: gravatar.url(email),
      verificationToken: verificationToken,
    });

    return res.send({
      Status: (201)["Created"],
      "Content-Type": "application/json",
      ResponseBody: {
        user: {
          email: "example@example.com",
          subscription: "starter",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const { error } = await validator.schemaLogin.validateAsync(req.body);
    if (error) {
      res.send({
        Status: (400)["Bad Request"],
        "Content-Type": "application/json",
        ResponseBody: "missing required name field",
      });
    }
  } catch (error) {
    console.error(e);
    next(e);
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send({
        Status: (401)["Unauthorized"],
        ResponseBody: {
          message: "Email or password is wrong",
        },
      });
    } else {
      const matched = bcrypt.compare(password, user.password);

      if (user.verify !== true) {
        return res
          .status(401)
          .send({ message: "Your account is not verified" });
      }

      if (!matched) {
        return res.send({
          Status: (401)["Unauthorized"],
          ResponseBody: {
            message: "Email or password is wrong",
          },
        });
      } else {
        const token = jwt.sign({ id: user._id }, process.env["JWT_SECRET"], {
          expiresIn: "1h",
        });
        await User.findByIdAndUpdate(user._id, { token });
        return res.send({
          Status: (200)["OK"],
          "Content-Type": "application/json",
          ResponseBody: {
            token: "exampletoken",
            user: {
              email: "example@example.com",
              subscription: "starter",
            },
          },
        });
      }
    }
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const log = await User.findByIdandUpdate(req.user.id, { token: null });

    if (log) {
      return res.send({ Status: (204)["No Content"] });
    } else {
      return res.send({
        Status: (401)["Unauthorized"],
        "Content-Type": "application/json",
        ResponseBody: {
          message: "Not authorized",
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

const currentUser = async (req, res, next) => {
  const { id } = req.params;

  try {
    const contact = await Contact.findById(id).exec();
    if (!contact) {
      return res.status(404).send({
        message: "Not found",
      });
    }
    if (contact.owner.toString() !== req.user.id) {
      return res.send({
        Status: (401)["Unauthorized"],
        "Content-Type": "application/json",
        ResponseBody: {
          message: "Not authorized",
        },
      });
    } else {
      return res.send({
        Status: (200)["OK"],
        "Content-Type": "application/json",
        ResponseBody: {
          email: "example@example.com",
          subscription: "starter",
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    await fs.rename(
      req.file.path,
      path.join(_dirname, "..", "public/avatars", req.file.filename)
    );

    const result = await User.findByIdAndUpdate(req.user.id, {
      avatarURL: req.file.path,
    }).exec();
    if (result !== null) {
      res.send({
        Status: (200)["OK"],
        "Content-Type": "application/json",
        ResponseBody: {
          avatarURL: req.file.path,
        },
      });
    } else {
      return res.send({
        Status: (401)["Unauthorized"],
        "Content-Type": "application/json",
        ResponseBody: {
          message: "Not authorized",
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

const verify = async (req, res, next) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken }).exec();

    if (user !== null) {
      await User.findByIdAndUpdate(user._id, {
        verificationToken: null,
        verify: true,
      });

      res.send({
        Status: (200)["OK"],
        ResponseBody: {
          message: "Verification successful",
        },
      });
    } else {
      res.semd({
        Status: (404)["Not Found"],
        ResponseBody: {
          message: "User not found",
        },
      });
    }
  } catch (err) {
    next(err);
  }
};

const verifyRepeatedly = async (req, res, next) => {
  const { email } = req.body;
  try {
    const { error } = await validator.schemaEmail.validateAsync(req.body);
    if (error) {
      res.send({
        Status: (400)["Bad Request"],
        "Content-Type": "application/json",
        ResponseBody: "missing required field email",
      });
    }
  } catch (error) {
    console.error(e);
    next(e);
  }
};
try {
  const user = await User.findOne({ email }).exec();
  if (user.verify !== true) {
    await User.findByIdAndUpdate(user._id, {
      verificationToken: null,
      verify: true,
    });
    res.send({
      Status: (200)["Ok"],
      "Content-Type": "application/json",
      ResponseBody: {
        message: "Verification email sent",
      },
    });
  } else {
    res.send({
      Status: (400)["Bad Request"],
      "Content-Type": "application/json",
      ResponseBody: {
        message: "Verification has already been passed",
      },
    });
  }
} catch (error) {
  next(error);
}

module.exports = {
  contactsList,
  getContact,
  removeContact,
  addContact,
  updateContacts,
  isFavorite,
  register,
  login,
  logout,
  currentUser,
  someContacts,
  filteredContacts,
  updateSubscription,
  uploadAvatar,
  verify,
  verifyRepeatedly,
};
