import LoginForm from "@/components/auth/login-form";
import Modal from "@/components/modals/modal";

const LoginPage = () => {
  return (
    <Modal>
      <div className="w-[95%] lg:w-[80%] mx-auto">
        {" "}
        <LoginForm />
      </div>
    </Modal>
  );
};

export default LoginPage;
