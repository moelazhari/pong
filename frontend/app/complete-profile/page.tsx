import UpdateForm from "@/components/complete-profile/updateForm"

export default function CompleteProfile() {
  return (
    <main className="grid place-content-center min-h-screen w-full bg-bg bg-cover bg-center p-4">
      <section className="flex flex-col items-center rounded-[50px] py-16 px-10 max-w-xl w-full mx-auto bg-white bg-opacity-20 backdrop-blur-lg drop-shadow-lg">
        <h1 className="text-3xl font-bold mb-12 text-center">Complete your profile</h1>
        <UpdateForm />
      </section>
    </main>
  )
}