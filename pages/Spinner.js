const Spinner = ({width = "50px", height = "50px"}) => {
    return (
        <div className="sk-chase"
             style={{
                 width: width,
                 height: height
             }}
            >
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
            <div className="sk-chase-dot"></div>
        </div>
    );
}

export default Spinner