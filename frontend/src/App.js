import './App.css';
import { useState, useEffect } from 'react';
import http from './http';
const parse = require('html-react-parser');

function App() {
  const [data, setData] = useState();
  const [time, setTime] = useState(Date.now());
  const [pagina, setPagina] = useState(1);
  const [password, setPassword] = useState("");
  const [atual, setAtual] = useState(true);
  const [ style, setStyle] = useState("completo");
  const controle = (new URLSearchParams(document.location.search)).get('controle') == "sim";

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    http.get('/rito', {
      params: {
        pagina: pagina,
        atual: atual,
      }
    }).then((content) => {
      setData(content);
      if(content.data.latim == "" && content.data.partitura == "") {
        setStyle("pt");
      } else if (content.data.partitura =="") {
        setStyle("bilingue");
      } else {
        setStyle("completo");
      }
      if (atual) {
        setPagina(content.data.id)
      }
    })
  }, [time, pagina, atual])

  useEffect(() => {
    if (controle) {
      http.post('/alterar', {
        pagina: pagina.toString(),
        senha: password,
      })
    }

  }, [pagina, controle]);

  if (!data) {
    return <p>Carregando...</p>
  }
  return (
    <div className="App">
      <h3>{data.data.titulo}</h3>
      <p>{data.data.referencia}</p>
      <table className="content">
        <tbody>
          <tr hidden={data.data.partitura == ""}>
            <td colSpan={4}>
              <img src={'imagens/' + data.data.partitura} />

            </td>
          </tr>
          <tr>
            <td colSpan={data.data.latim == "" ? 4 : 2} style={{ width: data.data.latim == "" ? '100%' : '50%' }} className={style}>{ data.data.portugues ? parse(data.data.portugues) : ""}</td>
            <td colSpan={2} style={{ width: '50%' }} className={style}>{parse(data.data.latim || "")}</td>
          </tr>

        </tbody>

      </table>
      <table className='footer'>
        <tbody>
          <tr>
            <td><input type="button" value={"Anterior"} onClick={() => {
              setPagina(parseInt(pagina) - 1);
            }} disabled={atual || pagina == 1} /></td>
            <td><input type="button" value={atual ? "Sincronizado" : "N??o sincronizado!"} onClick={() => {
              setAtual(!atual);
            }} /></td>
            <td><input type="button" value={"Pr??ximo"} onClick={() => {
              setPagina(parseInt(pagina) + 1);
            }} disabled={atual} /></td>
          </tr>
          <tr>
            <td colSpan={4}>P??gina {pagina}</td>
          </tr>
        </tbody>
        {/* CONTROLES ESPECIAIS */}
        <tfoot hidden={!controle}>
          <tr>
            <td colSpan={4} >
              <input type="password" value={password} onChange={(event) => {
                setPassword(event.target.value);
              }} />
            </td>
          </tr>
        </tfoot>

      </table>
    </div>
  );
}

export default App;
