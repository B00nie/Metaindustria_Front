#COMO USAR - Digite no terminal -> python test_camera.py 
#Para encerrar: CONTROL + C


from ultralytics import YOLO
import cv2
import sys

# 1. Carrega o modelo treinado pela equipe LIORA
try:
    model = YOLO("treinamento/weights/best.pt")
except Exception as e:
    print(f"Erro ao carregar o modelo: {e}")
    sys.exit()

# 2. Inicia a captura da webcam padrão (índice 0)
"""usuario = "admin"
senha = "T0MC4Tooi"

url = f"rtsp://{usuario}:{senha}@10.126.120.148:554/onvif1?tcp"

camera = cv2.VideoCapture(url)"""
camera = cv2.VideoCapture(1)  # Webcam padrão do sistema

# Teste de segurança: verificando se o OpenCV conseguiu acessar a câmera
if not camera.isOpened():
    print("Erro: Não foi possível abrir a webcam.")
    sys.exit()

print("=" * 50)
print("  SISTEMA DE MONITORAMENTO DE EPIS - EQUIPE LIORA")
print("  Pressione 'CONTROL + C' NO TERMINAL para sair.")
print("=" * 50)

# O bloco 'try' vai envolver o loop para capturar a interrupção do teclado (Ctrl+C)
try:
    while True:
        # Captura o frame atual da câmera
        sucesso, frame = camera.read()

        # Se houver falha no sinal da câmera, interrompe o loop
        if not sucesso:
            print("Erro ao receber o frame da webcam. Encerrando...")
            break

        # 3. Executa a predição usando o threshold de confiança de 50% (conf=0.5)
        resultados = model(frame, conf=0.5)

        # 4. Renderiza as Bounding Boxes e labels nativas do YOLO no frame
        # Isso garante o impacto visual das caixas mapeando os EPIs em tempo real
        frame_renderizado = resultados[0].plot()

        # 5. Lógica da Equipe: Identifica quais classes únicas estão na tela
        objetos_detectados = set()
        for box in resultados[0].boxes:
            classe_id = int(box.cls[0])
            nome_classe = model.names[classe_id]
            objetos_detectados.add(nome_classe)

        # 6. Desenha o painel preto de resumo no canto superior esquerdo
        # (x1, y1), (x2, y2), cor (BGR), espessura (-1 preenche o retângulo)
        cv2.rectangle(frame_renderizado, (0, 0), (220, 110), (0, 0, 0), -1)

        # Escreve o título do painel
        cv2.putText(
            frame_renderizado,
            "Detectados:",
            (10, 20),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (0, 255, 255), # Amarelo para o título
            1,
            cv2.LINE_AA
        )

        # Lista os objetos únicos detectados dentro do painel preto
        for i, nome in enumerate(objetos_detectados):
            cv2.putText(
                frame_renderizado,
                f"- {nome}",
                (10, 45 + i * 25),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (255, 255, 255), # Branco para os itens
                2,
                cv2.LINE_AA
            )

        # 7. Exibe a janela final com o monitoramento
        cv2.imshow("Monitoramento de EPIs v1.0 - LIORA", frame_renderizado)

        # 8. Atualiza a janela do OpenCV (necessário para o vídeo fluir)
        # Se o usuário fechar pelo terminal com Ctrl+C, o programa cai no 'except' abaixo
        cv2.waitKey(1)

except KeyboardInterrupt:
    # Captura especificamente o 'Control + C' pressionado no terminal
    print("\nExecução encerrada via Control + C pelo usuário.")

finally:
    # 9. Garante que os recursos de hardware sejam liberados de qualquer forma ao sair
    camera.release()
    cv2.destroyAllWindows()