const users = [
  {id: 1,
    email: 'aaaaaa@aaaaaa.aaaaaa',
    password: 'aaaaaa'
  }
]; // В реальном приложении используйте базу данных

class User {
  static async create({ email, password }) {
    const user = { id: users.length + 1, email, password };
    users.push(user);
    return user;
  }

  static async findByEmail(email) {
    return users.find((user) => user.email === email);
  }

  static async findById(id) {
    return users.find((user) => user.id === id);
  }
}

module.exports = User;