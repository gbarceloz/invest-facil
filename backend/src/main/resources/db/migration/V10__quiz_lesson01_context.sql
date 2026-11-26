-- ============================================================================
-- V10 - Contexto nas perguntas do quiz da aula 01
--
-- Atualiza o texto por posição, preservando IDs, alternativas e historico de
-- tentativas. Em banco novo o seeder cria as perguntas ja com o texto novo;
-- esta migration cobre o banco existente.
-- ============================================================================

UPDATE investfacil.quiz_questions q
   SET question = 'Uma pessoa pesquisa o preço de três celulares diferentes e usa os valores para decidir qual cabe no orçamento. Qual função do dinheiro está sendo usada nessa comparação?'
 WHERE q.position = 1
   AND q.lesson_id = (SELECT l.id FROM investfacil.lessons l WHERE l.slug = 'o-que-e-dinheiro');

UPDATE investfacil.quiz_questions q
   SET question = 'No mercado, você paga R$ 8 por um pão e leva o produto na hora, sem oferecer outra mercadoria em troca. Esse pagamento é um exemplo de qual função do dinheiro?'
 WHERE q.position = 2
   AND q.lesson_id = (SELECT l.id FROM investfacil.lessons l WHERE l.slug = 'o-que-e-dinheiro');

UPDATE investfacil.quiz_questions q
   SET question = 'Uma pessoa separa parte do salário na poupança para usar daqui a dois anos, preservando poder de compra para uma necessidade futura. Qual função do dinheiro está sendo exercida?'
 WHERE q.position = 3
   AND q.lesson_id = (SELECT l.id FROM investfacil.lessons l WHERE l.slug = 'o-que-e-dinheiro');
