package SignIn;


import java.util.HashMap;
import java.util.Scanner;

public class Main {
    static HashMap<String, String> users = new HashMap<>(); // email -> password

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        while(true) {
            System.out.println("Welcome! Choose an option:");
            System.out.println("1. Sign Up");
            System.out.println("2. Sign In");
            System.out.println("3. Sign in with Google (simulated)");
            System.out.println("4. Exit");
            String choice = sc.nextLine();

            switch(choice) {
                case "1":
                    System.out.print("Enter email: ");
                    String email = sc.nextLine();
                    System.out.print("Enter password: ");
                    String pass = sc.nextLine();
                    if(users.containsKey(email)) {
                        System.out.println("User already exists!");
                    } else {
                        users.put(email, pass);
                        System.out.println("Account created!");
                    }
                    break;

                case "2":
                    System.out.print("Enter email: ");
                    email = sc.nextLine();
                    System.out.print("Enter password: ");
                    pass = sc.nextLine();
                    if(users.containsKey(email) && users.get(email).equals(pass)) {
                        System.out.println("Login successful!");
                        // Here you could go to "Choose Sport" logic
                    } else {
                        System.out.println("Wrong email or password!");
                    }
                    break;

                case "3":
                    System.out.println("Google Sign-In simulated!");
                    System.out.println("Login successful via Google!");
                    // Here you could go to "Choose Sport" logic
                    break;

                case "4":
                    System.out.println("Exiting...");
                    sc.close();
                    System.exit(0);

                default:
                    System.out.println("Invalid choice, try again.");
            }
            System.out.println();
        }
    }
}