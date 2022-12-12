const AppError = require("../utils/AppError");

const { hash, compare } = require("bcryptjs");
const knex = require("../database/knex");

class UsersController {
    async create(request, response) {
        const { name, email, password } = request.body;

        if (!name) throw new AppError("É necessário um nome de usuário.");
        if (!email) throw new AppError("É necessário informar um email.");
        if (!password) throw new AppError("É necessário informar uma senha.");

        const emailExists = await knex("users").where({ email }).first();
        if (emailExists) throw new AppError("Este email já está em uso.");

        const hashedPassword = await hash(password, 8);

        await knex("users").insert({
            name,
            email,
            password: hashedPassword
        });
        
        return response.status(201).json({ message: "Cadastro criado com sucesso." });
    };

    async update(request, response) {
        const { name, email, password, confirm_password } = request.body;
        const { id } = request.params;

        if (!name && !email && !password) throw new AppError("Sem dados para serem atualizados.");
        if (!confirm_password) throw new AppError("Senha inválida.", 403);

        const user = await knex("users").where({ id }).first();

        if (!user) throw new AppError("Usuário não encontrado.", 404);

        const isCorrectPassword = compare(confirm_password, user.password);
        if (!isCorrectPassword) throw new AppError("Senha inválida.", 403);

        user.name = name ?? user.name;
        user.email = email ?? user.email;
        user.password = password ? await hash(password, 8) : user.password;

        if (email) {
            const emailExists = await knex("users").where({ email }).first();
            if (emailExists) throw new AppError("Este email já está em uso.");
        }

        await knex("users").update({
            name: user.name,
            email: user.email,
            password: user.password,
            updated_at: knex.fn.now()
        });

        return response.json({ message: "Dados atualizados com sucesso." });
    };
};

module.exports = UsersController;