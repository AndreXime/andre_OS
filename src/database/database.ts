import { createClient, type Client } from "@libsql/client";

interface ColumnDefinition {
	name: string;
	type: string;
}

const database = createClient({
	url: "http://127.0.0.1:8080",
	authToken: "",
});

async function ensureSchema(client: Client, tableName: string, schema: ColumnDefinition[]) {
	// 1. Gerar strings auxiliares
	const columnDefs = schema.map((c) => `${c.name} ${c.type}`).join(", ");
	const tempTableName = `${tableName}_temp_${Date.now()}`;

	// Iniciamos uma transação para garantir que não perderemos dados se algo falhar
	const transaction = await client.transaction("write");

	try {
		// 2. Criar a nova tabela com o schema atualizado
		await transaction.execute(`CREATE TABLE ${tempTableName} (${columnDefs});`);

		// 3. Verificar se a tabela original já existe
		const tableExists = await transaction.execute({
			sql: "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
			args: [tableName],
		});

		if (tableExists.rows.length > 0) {
			// 4. Descobrir quais colunas são comuns entre a velha e a nova (para o INSERT)
			const oldInfo = await transaction.execute(`PRAGMA table_info(${tableName});`);
			const oldCols = oldInfo.rows.map((r) => String(r.name));
			const commonCols = schema
				.map((c) => c.name)
				.filter((name) => oldCols.includes(name))
				.join(", ");

			if (commonCols.length > 0) {
				// 5. Copiar dados das colunas que permaneceram
				await transaction.execute(`
          INSERT INTO ${tempTableName} (${commonCols})
          SELECT ${commonCols} FROM ${tableName};
        `);
			}

			// 6. Deletar a tabela antiga
			await transaction.execute(`DROP TABLE ${tableName};`);
		}

		// 7. Renomear a temp para o nome original
		await transaction.execute(`ALTER TABLE ${tempTableName} RENAME TO ${tableName};`);

		await transaction.commit();
		console.log(`[DB] Schema de "${tableName}" sincronizado com sucesso.`);
	} catch (err) {
		await transaction.rollback();
		console.error(`[DB] Erro ao sincronizar schema de "${tableName}":`, err);
		throw err;
	}
}

await ensureSchema(database, "posts", [
	{ name: "id", type: "INTEGER PRIMARY KEY" },
	{ name: "slug", type: "TEXT UNIQUE NOT NULL" },
	{ name: "type", type: "TEXT NOT NULL" },
	{ name: "title", type: "TEXT NOT NULL" },
	{ name: "description", type: "TEXT" },
	{ name: "tags", type: "TEXT" },
	{ name: "featured", type: "INTEGER DEFAULT 0" },
	{ name: "date", type: "TEXT" },
	{ name: "content", type: "TEXT" },
	{ name: "status", type: "TEXT" },
	{ name: "url", type: "TEXT" },
]);

export default database;
