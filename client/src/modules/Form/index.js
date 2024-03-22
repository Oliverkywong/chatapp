import { useState } from "react"
import Button from "../../components/button"
import Input from "../../components/input"
import { useNavigate } from "react-router-dom"

const Form = ({
    isSignInPage = false
}) => {
    const [data, setData] = useState({
        ...(!isSignInPage && {
            fullName: ''
        }),
        email: '',
        password: ''
    })
    const navigate = useNavigate()
    return (
        <div className="bg-light h-screen flex justify-center items-center">
            <div className="bg-white w-[600px] h-[800px] shadow-lg rounded-lg flex flex-col justify-center items-center">
                <div className="text-4xl front-extrabold">Welcome {isSignInPage && 'Back'}</div>
                <div className="text-xl font-light">{isSignInPage ? 'Sign up now to get explored' : 'Sign up now to get started'}</div>
                <form className="flex flex-col w-full items-center" onSubmit={() => { console.log('sub') }}>
                    {!isSignInPage && <Input lable="full name" name="name" placeholder="enter your name" className="mb-6 w-[50%]" value={data.fullName} onChange={(e) => { setData({ ...data, fullName: e.target.value }) }} />}
                    <Input lable="email" name="email" type='email' placeholder="enter your email" className="mb-6 w-[50%]" value={data.email} onChange={(e) => { setData({ ...data, email: e.target.value }) }} />
                    <Input lable="password" name="password" type="password" placeholder="enter your password" className="mb-14 w-[50%]" value={data.password} onChange={(e) => { setData({ ...data, password: e.target.value }) }} />
                    <Button lable={isSignInPage ? 'sign in' : 'sign up'} className="w-1/2 mb-2" type='submit' />
                </form>
                <div>{isSignInPage ? 'Didnt have an account?' : 'Already have an account?'} <span className="text-primary cursor-pointer underline" onClick={()=>{navigate(`/users/${isSignInPage ? 'sign_up' : 'sign_in'}`)}}>{isSignInPage ? 'sign up' : 'sign in'}</span></div>
            </div>
        </div>
    )
}

export default Form 