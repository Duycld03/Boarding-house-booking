import ReactLoading from "react-loading";

function Loader({
  size = 50,
  color = "#2db7f5",
  customClass = "",
  type = "spinningBubbles",
}) {
  return (
    <div className={`flex justify-center items-center h-screen ${customClass}`}>
      <ReactLoading type={type} color={color} height={size} width={size} />
    </div>
  );
}

export default Loader;
