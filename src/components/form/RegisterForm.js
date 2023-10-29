import Input from "./Input";
import {useFormik} from "formik";
import {useNavigate} from "react-router";
import * as Yup from "yup";
import {getAuth, createUserWithEmailAndPassword} from "firebase/auth"
import app from "../../base";
import { useAuthContext } from "../../hooks/useAuthContext";
import { localStorageUserCreate as userCreate } from "../../utils/localStorageUtils";
import { withAuthorization } from "../../HOCs/withAuthorization";

const auth = getAuth(app);

const Register = () => {
    const {setCurrentUser, setShowLoader} = useAuthContext()
    const navigate = useNavigate()
    const {handleSubmit, handleChange, values, errors, touched, handleBlur} = useFormik({
        initialValues: {
            login: "",
            password: "",
            confirmPassword: "",
        },
        validationSchema: Yup.object({
            login: Yup.string()
                .email("login must be a valid: user@exemple.com")
                .required("Login is a required"),
            password: Yup.string()
                .min(6, "password mast be > 5 symbols")
                .max(15, "password mast be < 15 symbols")
                .matches(/^[\w.-]+$/, 'password can only contain latin letters, numbers, and symbols: "_", "-"')
                .required("Password is a required"),
            confirmPassword: Yup.string()
                .oneOf([Yup.ref("password"), ""], "password must match")
                .required("Confirm password is a required")
        }),
        onSubmit: async ({login, password}) => {
            try {
                await createUserWithEmailAndPassword(auth, login, password)
                    .then((userCredential) => {
                        const user = userCredential.user
                        if (user) {
                            setCurrentUser(user);
                            setShowLoader(true);
                            navigate("/home");
                            userCreate(JSON.stringify(user.uid));
                        }
                    })
            } catch (err){
                errors.login = err.code
            }
        }
    })

    return (
        <form className="form" onSubmit={handleSubmit}>
            <Input name="login"
                   type="email"
                   placeholder="Email"
                   value={values.login}
                   onChange={handleChange}
                   onBlur={handleBlur}
                   touched={touched.login}
                   errors={errors.login}
            />
            <Input name="password"
                   type="password"
                   placeholder="Password"
                   value={values.password}
                   onChange={handleChange}
                   onBlur={handleBlur}
                   touched={touched.password}
                   errors={errors.password}
            />
            <Input name="confirmPassword"
                   type="password"
                   placeholder="Confirm Password"
                   value={values.confirmPassword}
                   onChange={handleChange}
                   onBlur={handleBlur}
                   touched={touched.confirmPassword}
                   errors={errors.confirmPassword}
            />
            <button className="submit-btn" type="submit">Submit</button>
        </form>
    )
}

const RegisterForm = withAuthorization(Register)

export default RegisterForm