export default function Display(props) {
  return (
    <>
      <div className="ml-2 mt-5 w-40 h-40 border border-yellow-500 flex flex-col justify-center">
        <p className="p-2 mx-auto">ABC CORP</p>
        <p className="p-2 mt-1 mx-auto">{props.totalAmount}</p>
      </div>
    </>
  );
}
