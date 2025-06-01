
function Formclosed() {
  return (
    <div className="flex items-center justify-center min-h-screen ">
      <div className="p-8  rounded-xl shadow-2xl w-96 border border-gray-700 bg-black/50">
        <div className="text-center flex justify-center flex-col">
          <h1 className="text-3xl font-bold text-white mb-6 tracking-tight">
            KJSCE ACM Application
          </h1>
          <div className="relative mx-auto">
            <img
              src="logo_withoutbg.png"
              alt="Somaiya Logo"
              className="w-40 h-40 object-contain filter drop-shadow-lg "
            />
          </div>
            <p className="text-3xl font-bold text-white tracking-tight text-center mb-2">Form closed</p>
            <p className="text-3xl font-bold text-white tracking-tight text-center">Thank You for showing your interest</p>
        </div>
      </div>
    </div>
  )
}

export default Formclosed