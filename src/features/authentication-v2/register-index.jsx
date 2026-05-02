// src/features/authentication-v2/register-v2.jsx

import RegisterFormV2 from "./Register";



// import RegisterFormV2 from "./register-form-v2";

const RegisterV2 = () => {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <RegisterFormV2/>
      </div>
    </div>
  );
};

export default RegisterV2;